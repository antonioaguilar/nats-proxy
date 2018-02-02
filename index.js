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

var help = argv.h || argv.help;
var version = argv.v || argv.version;
var tls_enabled = argv.t || argv.tls;
var cert_file = argv.C || argv.cert;
var key_file = argv.K || argv.key;
var host = process.env.HOST || '0.0.0.0';
var port = parseInt(argv.p || argv.port || process.env.PORT || 8080);
var debug = argv.d || argv.debug;
var nats_url = argv.n || argv.nats || 'nats://0.0.0.0:4222';
var cert, key;

if (help || _.size(argv) === 1) cmd.getHelp();
if (version) cmd.getVersion();
if (cert_file) cert = cmd.getCertificate(cert_file);
if (key_file) key = cmd.getKey(key_file);

var nats = NATS.connect({
  url: nats_url,
  json: true,
  client: pkg.name,
  reconnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 5000
});

app.use(monitor({ title: pkg.name + ' [' + ip.address() + ']', path: '/status' }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', function (req, res) {
  res.redirect('/status');
});

app.post('/', function (req, res) {
  delete req.body.__subject;
  nats.publish(req.body.__subject || 'DEFAULT', req.body);
  if (debug) console.log(new Date().toISOString(), JSON.stringify(req.body));
  res.status(200).end();
});

if (tls_enabled && cert && key) {
  var httpsOptions = { key: key, cert: cert };
  https.createServer(httpsOptions, app).listen(port, host, function () {
    console.log('Server running on https://' + host + ':' + port);
  });
}
else {
  http.createServer(app).listen(port, host, function () {
    console.log('Server running on http://' + host + ':' + port);
  });
}
