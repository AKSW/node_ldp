# node_ldp

Implementation of the Linked Data Platform for Node.

## Components

### RDF Middleware

* performs content negotiation
* sets HTTP response header
* parses body into internal canonical format (t.b.s)
* serializes internal canonical format (t.b.s.) to RDF response

### Router

* must determine whether requested resource is resource or container
* must determine whether request is valid

### RDF Store

* check whether resource exists
* get CBD of a given resource
* update an existing resource with RDF change set (?)
* according to LDP working draft, search by predicate not required
  * http://www.w3.org/TR/ldp/
  * what do we need that for?

## Dependencies

You can install some missing dependencies with

    make libs

Furthermore you will need the [Raptor RDF parser](http://github.com/0xfeedface/node_raptor).

### Connect

* http://www.senchalabs.org/connect/
* allows us to plug in RDF middleware
* allows us to plug in WebID auth later

## Usage

If you have all dependencies you can check if LDP works correctly by running the tests with

    make test

You can start LDP with several options. To see the options run `bin/start --help`

    Usage: start [options]

    Options:

    -h, --help                   output usage information
    -l, --load <file>            path to file with triples to serve
    -f, --fake-namespace <host>  fake namespace of URIs for testing
    -p, --port <port>            fake host part of URIs for testing

