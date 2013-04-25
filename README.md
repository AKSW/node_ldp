`node_ldp` -- Linked Data Platform for Node
===========================================

Have you ever wanted to quickly publish Linked Data resources on the Web?
Then node_ldp is your answer.
Since `node_ldp` is an implementation of the [Linked Data Platform specification](http://www.w3.org/TR/ldp/) it additionally allows you to:

* create resources via `PUT`,
* update/create resources via `POST`,
* delete resources via `DELETE`,

All of this for plain resources or resources managed in [LDP containers](http://www.w3.org/TR/ldp/#linked-data-platform-containers).

## Runtime Dependencies

You can install most dependencies with

    make libs

In addition, [`node_raptor`](http://github.com/0xfeedface/node_raptor) is required.

## Usage

You can start LDP with several options.
To see the options run `bin/start --help`.
Fake namespace and initial triples file are currently *required*.

    Usage: start [options]

    Options:

    -h, --help                   output usage information
    -l, --load <file>            path to file with triples to serve
    -f, --fake-namespace <host>  fake namespace of URIs for testing
    -p, --port <port>            fake host part of URIs for testing

## Running Test

`node_ldp`'s test suite requires' `nodeunit`.
Once you have that installed just type

    make test

at the command prompt.

