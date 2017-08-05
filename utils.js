var pkg = require('./package.json');
var fs = require('fs-extra');
var ip = require('ip');

function getHelp() {
  console.log([
    '', 'NATS.io messaging proxy v' + pkg.version,
    '', 'usage: nats-proxy [options]',
    '',
    'options:',
    '  -p --port    Port number (Default: 5000)',
    '  -n --nats    NATS.io server URL (Default: nats://' + ip.address() + ':4222)',
    '  -d --debug   Enable debug mode',
    '  -c --config  Routes configuration file',
    '  -t --tls     Enable TLS / HTTPS',
    '  -C --cert    Server certificate file',
    '  -K --key     Private key file',
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
  catch (err) {
    console.error('Error: Could not find file');
    console.error(err);
    process.exit();
  }
}

function getCertificate(cert_file) {
  try {
    fs.statSync(cert_file).isFile();
    return fs.readFileSync(cert_file);
  }
  catch (err) {
    console.error('Error: Could not find certificate file');
    process.exit();
  }
}

function getKey(cert_key) {
  try {
    fs.statSync(cert_key).isFile();
    return fs.readFileSync(cert_key);
  }
  catch (err) {
    console.error('Error: Could not find key file');
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
