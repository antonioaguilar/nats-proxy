#!/usr/bin/env node

var _ = require('lodash');
var cmd = require('./commands');
var fs = require('fs-extra');
var NATS = require('nats');
var http = require('http');
var https = require('https');
var express = require('express');
var monitor = require('express-status-monitor');
var argv = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');
var app = express();

var help = argv.h || argv.help;
var version = argv.v || argv.version;
var config_file = argv.c || argv.config;
var ssl_enabled = argv.S || argv.ssl;
var nats_tls = argv.T || argv.tls;
var cert_file = argv.C || argv.cert;
var key_file = argv.K || argv.key;
var default_port = argv.p || argv.port;
var default_host = argv.H || argv.host;
var debug = argv.d || argv.debug;
var nats, cert, key, config;

if(help || _.size(argv) === 1) {
  cmd.getHelp();
}

if(version) {
  cmd.getVersion();
}

if(cert_file) {
  cert = cmd.getCertificate(cert_file);
}

if(key_file) {
  key = cmd.getKey(key_file);
}

if(config_file) {
  config = cmd.getConfig(config_file);
}

var proxy_port = default_port || 4000;
var proxy_host = default_host || '0.0.0.0';
var nats_servers = config_file ? config.nats_servers : ['nats://0.0.0.0:4222'];
var default_route = config_file ? config.default_route : '/nats-proxy';
var routes = config_file ? config.routes : [];

if(!nats_tls) {
  nats = NATS.connect({ servers: nats_servers });
}
else if(nats_tls && cert && key) {
  var tlsOptions = { key: key, cert: cert };
  nats = NATS.connect({ servers: nats_servers, tls: tlsOptions });
}
else {
  console.error('Could not configure TLS on NATS server');
  process.exit();
}

app.use(monitor());
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// create the channel routes from config file
routes.forEach(function(item) {
  app.post(item.url, function(req, res) {
    nats.publish(item.channel, JSON.stringify(req.body));
    res.end();
  });
});

// create a default route to publish to a custom channels
// if "channel_id" is passed on the JSON payload, then we use it as the channel name
// otherwise we publish any received messages to the DEFAULT channel
app.post(default_route, function(req, res) {
  var data = JSON.stringify(req.body);
  var channel_id = req.body.channel_id || 'DEFAULT';
  nats.publish(channel_id, data);
  if(debug) console.log('[' + new Date().toISOString() + '] '  + channel_id + ':' + data);
  res.end();
});

if(ssl_enabled && cert && key) {
  var httpsOptions = { key: key, cert: cert };
  https.createServer(httpsOptions, app).listen(proxy_port, proxy_host, function() {
    console.log([
      '', 'NATS.io messaging proxy server',
      '',
      '-  Proxy server running on https://' + proxy_host + ':' + proxy_port,
      '-  NATS server running on ' + nats.currentServer.url.host,
      ''
    ].join('\n'));
  });
}
else {
  http.createServer(app).listen(proxy_port, proxy_host, function() {
    console.log([
      '', 'NATS.io messaging proxy server',
      '',
      '-  Proxy server running on http://' + proxy_host + ':' + proxy_port,
      '-  NATS server running on nats://' + nats.currentServer.url.host,
      ''
    ].join('\n'));
  });
}




