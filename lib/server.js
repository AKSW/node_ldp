var http = require('http'),
    util = require('util'),
    connect = require('connect'),
    mime = require('./mimetype'),
    rdf = require('./rdf'),
    router = require('./router'),
    Memory = require('./memory').Memory,
    raptor = require('raptor'),
    path = require('path'),
    fs = require('fs'),
    utils = require('./utils');

exports.createServer = function (options, store) {
    var listener = connect()
        .use(mime())
        .use(rdf.bodyParser())
        .use(function (request, response) {
            router.createRouter(options, store).handle(request, function (result) {
                if (result.status == 200 && typeof result.body == 'object') {
                    rdf.serialize(result.body, response.type, function (err, body) {
                        if (err) {
                            response.writeHead(500, result.headers);
                            response.end();
                        } else {
                            var headers = utils.merge(result.headers, { 'Content-Length': body.length });
                            response.writeHead(result.status, headers);
                            response.end(body);
                        }
                    });
                } else {
                    response.writeHead(result.status, result.headers);
                    response.end(result.body);
                }
            });
        });
    var server = http.createServer(listener).listen(options.port);
};

exports.start = function (options, cb) {
    var filePath = path.normalize(options.load),
        parser = raptor.newParser('guess');

    if (!fs.existsSync(filePath)) {
        return cb({ message: 'data file not readable' });
    }

    try {
        var descriptions = {};
        parser.on('statement', function (statement) {
            rdf.mixinStatement(descriptions, statement);
        });
        parser.on('end', function () {
            var store  = new Memory();
            Object.keys(descriptions).forEach(function (uri) {
                var description = {};
                description[uri] = descriptions[uri];
                store.create(uri, description);
            });

            cb(null, exports.createServer(options, store));
        });
        parser.parseFile(filePath);
    } catch (error) {
        cb(error);
    }
};

