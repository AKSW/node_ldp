var http = require('http'),
    util = require('util'),
    connect = require('connect'),
    mime = require('./mimetype'),
    rdf = require('./rdf'),
    router = require('./router'),
    Memory = require('./memory').Memory,
    Container = require('./container').Container;
    raptor = require('raptor'),
    path = require('path'),
    fs = require('fs'),
    utils = require('./utils'),
    config = require(require('path').join(__dirname, '..', 'config'));

exports.createServer = function (options, store) {
    var listener = connect()
        .use(mime())
        .use(rdf.bodyParser())
        .use(function (request, response) {
            request.protocol = 'http';
            router.createRouter(options, store).handle(request, function (result) {
                if (result.status == 200 && typeof result.body == 'object') {
                    rdf.serialize(result.body, response.type, function (err, body) {
                        if (err) {
                            response.writeHead(500, result.headers);
                            response.end();
                        } else {
                            var headers = utils.merge(result.headers, { 'Content-Length': body.length });

                            for (var key in config.typeMapping) {
                                if (config.typeMapping.hasOwnProperty(key)) {
                                    if (response.type == config.typeMapping[key]) {
                                        headers['Content-Type'] = key;
                                        break;
                                    }
                                }
                            }

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
        var descriptions = {},
            blankNodeDescriptions = {};
        parser.on('statement', function (statement) {
            if (statement.subject.type == 'uri') {
                rdf.mixinStatement(descriptions, statement);
            } else {
                rdf.mixinStatement(blankNodeDescriptions, statement);
            }
        });
        parser.on('end', function () {
            var store  = new Memory(),
                container = new Container(store);
            container.createContainer('http://webid.example.com/container1/');

            Object.keys(descriptions).forEach(function (uri) {
                var descr = {};
                descr[uri] = descriptions[uri];
                store.create(uri, createDescription(descr, blankNodeDescriptions));
            });

            cb(null, exports.createServer(options, container));
        });
        parser.parseFile(filePath);
    } catch (error) {
        cb(error);
    }
};

var createDescription = function (baseDescription, blankNodeDescriptions) {
    var result = baseDescription;
    Object.keys(baseDescription).forEach(function (subject) {
        Object.keys(baseDescription[subject]).forEach(function (predicate) {
            baseDescription[subject][predicate].forEach(function (object) {
                // If we hit a blank node, pull in its description (recursively)
                if (object.type === 'bnode') {
                    var nodeName = '_:' + object.value,
                        bnode = {};
                    bnode[nodeName] = blankNodeDescriptions[nodeName];
                    rdf.mixinDescription(result, createDescription(bnode, blankNodeDescriptions));
                }
            });
        });
    });
    return result;
};

