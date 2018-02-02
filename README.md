# nats-proxy

A simple NATS.io messaging proxy

## Install

```bash
$ npm install -g nats-proxy
```

## Usage

```bash
$ nats-proxy --help

NATS.io messaging proxy

usage: nats-proxy [options]

options:
  -p --port    Port number (Default: 8080)
  -n --nats    NATS server URL (Default: nats://0.0.0.0:4222)
  -d --debug   Enable debug output
  -t --tls     Enable TLS / HTTPS
  -C --cert    Server certificate file
  -K --key     Private key file
  -h --help    Print this list and exit
  -v --version Print the current version
```

## Publishing data to NATS

External clients can issue HTTP post requests to the default route `/` and publish messages directly to [NATS.io](https://nats.io/), for example:

```bash
curl -s -H "Content-Type: application/json" \
-X POST -d '{"__subject":"CUSTOMER","account":"ACC-123456789","orders":"PO-123456789"}' \
http://localhost:8080/
```

This command will post the JSON data to the default route [http://localhost:8080/](http://localhost:8080/), the `nats-proxy` server will read and parse the JSON data and will publish this data to [NATS.io](https://nats.io/) with a subject called `CUSTOMER`.

This feature allows clients to arbitrarily specify a NATS subject and publish messages directly to NATS without using the default [NATS client libraries](https://nats.io/download/).

## Monitoring

You can monitor ```nats-proxy``` and view live stats by accessing the [http://localhost:8080/](http://localhost:8080/).

## Run in Docker container

You can run ```nats-proxy``` in a Docker container as follows:

```bash
docker pull aaguilar/nats-proxy
```

```bash
docker run -it --rm -p 8080:8080 aaguilar/nats-proxy -p 8080 -n nats://localhost:4222
```
