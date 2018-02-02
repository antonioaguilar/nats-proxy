var pkg = require('./package.json');
var fs = require('fs-extra');

function getHelp() {
  console.log([
    '', 'NATS.io messaging proxy',
    '', 'usage: nats-proxy [options]',
    '',
    'options:',
    '  -p --port    Port number (Default: 8080)',
    '  -n --nats    NATS server URL (Default: nats://0.0.0.0:4222)',
    '  -d --debug   Enable debug output',
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
  getCertificate: getCertificate,
  getKey: getKey
};
