# nats-proxy

A simple NATS.io messaging proxy

## Install 

```bash
$ npm install -g nats-proxy
```

## Usage

```bash
$ nats-proxy --help

NATS.io messaging proxy v1.5.0

usage: nats-proxy [options]

options:
  -p --port    Port number (Default: 5000)
  -n --nats    NATS.io server URL (Default: nats://192.168.1.35:4222)
  -d --debug   Enable debug mode
  -c --config  Routes configuration file
  -t --tls     Enable TLS / HTTPS
  -C --cert    Server certificate file
  -K --key     Private key file
  -h --help    Print this list and exit
  -v --version Print the current version
```

## Configuration
 
You can configure custom messaging routes via a JSON file (e.g. ```routes.json```), for example: 
  
```json
{
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

then, pass this configuration when running ```nats-proxy``` as follows:

```bash
$ nats-proxy --port 5000 --config routes.json

NATS.io messaging proxy v1.2.8

-  Proxy running on http://192.168.1.33:5000
-  NATS running on nats://192.168.1.33:4222
```

Each route is mapped to a [NATS channel](http://nats.io/documentation/internals/nats-protocol/) (e.g. topic name). We can make HTTP POST requests to those routes and publish messages directly to [NATS server](https://nats.io/) channels, for example:

```bash
$ curl -s -H "Content-Type: application/json" -X POST -d '{"account_id":"ACC-123456789","order_id":"PO-123456789"}' http://localhost:5000/accounts
```

in this example, JSON data is pushed to the ```/accounts``` route and published on the ```ACCOUNTS``` channel.  

There is also a ```default_route``` that can be used to publish messages to a specific ```channel```, for example:
 
```bash
$ curl -s -H "Content-Type: application/json" -X POST -d '{"channel_id":"RANDOM_CHANNEL","account":"ACC-123456789","orders":"PO-123456789"}' http://localhost:5000/nats-proxy
```

this command will post the JSON data to the default route (e.g. [http://localhost:4000/nats-proxy](http://localhost:4000/nats-proxy)) and will publish this data to the [NATS server](https://nats.io/) on a channel called ```RANDOM_CHANNEL```.
This allows clients to specify a NATS channel ID to publish messages when hitting the default route. 

## Monitoring

You can monitor ```nats-proxy``` and view live stats by accessing the ```/status``` route, e.g. open this URL in your browser [http://localhost:5000/status](http://localhost:5000/status)

## Run in Docker container

You can run ```nats-proxy``` in a Docker container as follows:

```bash
docker pull aaguilar/nats-proxy
```

```bash
docker run -it --rm -p 5000:5000 -v $(pwd)/:/root aaguilar/nats-proxy -p 5000 -n nats://192.168.1.33:4222 -c /root/routes.json
```
