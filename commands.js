var pkg = require('./package.json');
var fs = require('fs-extra');

function getHelp() {
  console.log([
    '', 'NATS.io messaging proxy server',
    '', 'usage: nats-proxy [options]',
    '',
    'options:',
    '  -p --port    Port number (Default: 4000)',
    '  -H --host    Host IP (Default: 0.0.0.0)',
    '  -d --debug   Enable debug mode',
    '  -c --config  Configuration file',
    '  -S --ssl     Enable HTTPS on proxy server',
    '  -C --cert    Server certificate file',
    '  -K --key     Private key for server certificate',
    //'  -T --tls     Enable TLS on NATS server', // disable TLS on NATS because it requires a CA certificate
    '  -h --help    Print this list and exit',
    '  -v --version Print the current version',
    ''
  ].join('\n'));
  process.exit();
}

function getVersion() {
  console.log(pkg.version);
  process.exit();
}

function getConfig(config_file) {
  try {
    fs.statSync(config_file).isFile();
    return fs.readJSONSync(config_file);
  }
  catch(err) {
    console.error('Error in configuration file');
    process.exit();
  }
}

function getCertificate(cert_file) {
  try {
    fs.statSync(cert_file).isFile();
    return fs.readFileSync(cert_file);
  }
  catch(err) {
    console.error('Error in certificate file');
    process.exit();
  }
}

function getKey(cert_key) {
  try {
    fs.statSync(cert_key).isFile();
    return fs.readFileSync(cert_key);
  }
  catch(err) {
    console.error('Error in key file');
    process.exit();
  }
}

module.exports = {
  getHelp: getHelp,
  getVersion: getVersion,
  getConfig: getConfig,
  getCertificate: getCertificate,
  getKey: getKey
};
