#!/usr/bin/env node

var pkg = require('./package.json');
var cmd = require('./utils');
var _ = require('lodash');
var ip = require('ip');
var fs = require('fs-extra');
var NATS = require('nats');
var http = require('http');
var https = require('https');
var express = require('express');
var monitor = require('express-status-monitor');
var argv = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');
var app = express();

var proxy_host = ip.address();
var help = argv.h || argv.help;
var version = argv.v || argv.version;
var config_file = argv.c || argv.config;
var tls_enabled = argv.t || argv.tls;
var cert_file = argv.C || argv.cert;
var key_file = argv.K || argv.key;
var default_port = argv.p || argv.port;
var debug = argv.d || argv.debug;
var default_nats = argv.n || argv.nats;
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

var proxy_port = parseInt(default_port) || 5000;
var nats_host = default_nats || ip.address();
var default_route = config_file ? config.default_route : '/nats-proxy';
var routes = config_file ? config.routes : [];

nats = NATS.connect({ servers: ['nats://' + nats_host + ':4222'] });

app.use(monitor());
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

routes.forEach(function(item) {
  app.post(item.url, function(req, res) {
    nats.publish(item.channel, JSON.stringify(req.body));
    res.end();
  });
});

app.post(default_route, function(req, res) {
  var channel = req.body.channel || 'DEFAULT';
  delete req.body.channel;
  var data = JSON.stringify(req.body);
  nats.publish(channel, data);
  if(debug) console.log(new Date().toISOString(), data);
  res.end();
});

if(tls_enabled && cert && key) {
  var httpsOptions = { key: key, cert: cert };
  https.createServer(httpsOptions, app).listen(proxy_port, proxy_host, function() {
    console.log([
      '', 'NATS.io messaging proxy v' + pkg.version,
      'Service running on https://' + proxy_host + ':' + proxy_port,
      'NATS.io running on nats://' + nats.currentServer.url.host,
      ''
    ].join('\n'));
  });
}
else {
  http.createServer(app).listen(proxy_port, proxy_host, function() {
    console.log([
      '', 'NATS.io messaging proxy v' + pkg.version,
      'Service running on http://' + proxy_host + ':' + proxy_port,
      'NATS.io running on nats://' + nats.currentServer.url.host,
      ''
    ].join('\n'));
  });
}
