# nats-proxy

A simple NATS.io messaging proxy

## Install 

```bash
$ npm install -g nats-proxy
```

## Usage

```bash
$ nats-proxy --help

NATS.io messaging proxy server

usage: nats-proxy [options]

options:
  -p --port    Port number (Default: 4000)
  -H --host    Host IP (Default: 0.0.0.0)
  -d --debug   Enable debug mode
  -c --config  Configuration file
  -S --ssl     Enable HTTPS on proxy server
  -C --cert    Server certificate file
  -K --key     Private key for server certificate
  -h --help    Print this list and exit
  -v --version Print the current version
```

## Configuration 

To use ```nats-proxy```, you need to create a JSON configuraton file (e.g. ```config.json```):

```json
{
  "nats_servers": [
    "nats://0.0.0.0:4222"
  ],
  "default_route": "/nats-proxy",
  "routes": [
    {
      "url": "/ping",
      "channel": "HEARTBEAT"
    }
  ]
}
```

then, pass this configuration when running ```nats-proxy``` as follows:

```bash
$ nats-proxy --port 4000 --config ./config.json

NATS.io messaging proxy server

-  Proxy server running on http://0.0.0.0:4000
-  NATS server running on nats://0.0.0.0:4222
```

this command will start ```nats-proxy``` on [http://localhost:4000](http://localhost:4000) and connect to a [NATS server](https://nats.io/) instance on [nats://localhost:4222](nats://localhost:4222) 

## Routes
 
You can configure custom messaging routes, for example: 
  
```json
{
  "nats_servers": [
    "nats://0.0.0.0:4222"
  ],
  "default_route": "/nats-proxy",
  "routes": [
    {
      "url": "/accounts",
      "channel": "ACCOUNTS"
    },
    {
      "url": "/orders",
      "channel": "ORDERS"
    },
    {
      "url": "/products",
      "channel": "PRODUCTS"
    }
  ]
}

```

Each route is mapped to a [NATS channel](http://nats.io/documentation/internals/nats-protocol/) (e.g. topic name). We can make HTTP POST requests to those routes and publish messages directly to [NATS server](https://nats.io/) channels, for example:

```bash
$ curl -s -H "Content-Type: application/json" -X POST -d '{"account_id":"ACC-123456789","order_id":"PO-123456789"}' http://localhost:4000/accounts
```

in this example, JSON data is pushed to the ```/accounts``` route and published on the ```ACCOUNTS``` channel.  

There is also a ```default_route``` that can be used to publish messages to a specific ```channel_id```, for example:
 
```bash
$ curl -s -H "Content-Type: application/json" -X POST -d '{"channel_id":"RANDOM_CHANNEL","account":"ACC-123456789","orders":"PO-123456789"}' http://localhost:4000/nats-proxy
```

this command will post the JSON data to the default route (e.g. [http://localhost:4000/nats-proxy](http://localhost:4000/nats-proxy)) and will publish this data to the [NATS server](https://nats.io/) on a channel called ```RANDOM_CHANNEL```.
This allows clients to specify a NATS channel ID to publish messages when hitting the default route. 
