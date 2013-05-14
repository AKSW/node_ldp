var raptor = require('raptor'),
    crypto = require('crypto'),
    jsonld = require('jsonld'),
    config = require(require('path').join(__dirname, '..', 'config'));

exports.bodyParser = function (options) {
    return function (request, response, next) {
        var type   = request.headers['content-type'],
            format = config.typeMapping[type];

        if (format === 'jsonld') {
            var data = '';
            request.on('data', function (chunk) { data += chunk; });
            request.on('end',  function () {
                toRDFJSON(JSON.parse(data), function (err, rdfJSON) {
                    if (err) {
                        next({ status: 400, message: err.message });
                    } else {
                        request.body = rdfJSON;
                        next();
                    }
                });
            });
        } else {
            // use `guess` parser if we could not detect format
            if (!format) { format = 'guess'; }

            parse(request, format, function (err, result) {
                if (err) {
                    next({ status: 400, message: err.message });
                } else {
                    request.body = result;
                    next();
                }
            });
        }
    };
};

var parse = exports.parse = function (stream, format, cb) {
  var parser      = raptor.newParser(format),
      description = {};

    if (!parser) { cb(new Error('No viable parser found.')); }

    parser.on('statement', function (statement)           { mixinStatement(description, statement); });
    parser.on('message',   function (type, message, code) { cb(new Error(message)); });
    parser.on('end',       function ()                    { cb(null, description); });

    parser.parseStart('__PARSER__');

    var flag = false;
    stream.on('data', function (chunk) { flag = true; parser.parseBuffer(chunk); });
    stream.on('end',  function () {
        if (!flag) { return cb(null, description); }
        parser.parseBuffer();
    });
};

var serialize = exports.serialize = function (description, format, cb) {
    if (format === 'jsonld') { return toJSONLD(description, config.context, cb); }

    var body       = '',
        serializer = raptor.newSerializer(format);

    if (!serializer)                      { return cb('Error'); }
    if (!Object.keys(description).length) { return cb(null, ''); }

    serializer.on('data', function (data) { body += data; });
    serializer.on('end',  function ()     { cb(null, body); });

    serializer.serializeStart();

    Object.keys(description).forEach(function (subject) {
        var type = 'uri',
            subjectName = subject;
        
        var parts = subject.split(':', 2);
        if ('_' === parts[0]) {
            type        = 'bnode';
            subjectName = parts[1];
        }

        Object.keys(description[subject]).forEach(function (predicate) {
            description[subject][predicate].forEach(function (object) {
                var statement = {
                    'subject':   { type: type,        value: subjectName },
                    'predicate': { type: 'uri',       value: predicate },
                    'object':    { type: object.type, value: object.value }
                };

                if (object.datatype) {
                    statement.object.datatype = object.datatype;
                    statement.object.type     = 'typed-literal';
                } else if (object.lang) {
                    statement.object.lang     = object.lang;
                }

                serializer.serializeStatement(statement);
            });
        });
    });

    serializer.serializeEnd();
};

var mixinStatement = exports.mixinStatement = function (target, statement) {
    var subject = statement.subject.value;
    if (statement.subject.type !== 'uri') { subject = '_:' + subject; }

    var predicate = statement.predicate.value;

    target[subject]            = target[subject]            || {};
    target[subject][predicate] = target[subject][predicate] || [];

    var object = {
        value: statement.object.value,
        type:  statement.object.type.replace('typed-', '')
    };
    if (statement.object.type === 'typed-literal') { object.datatype = statement.object.datatype; }
    else if (statement.object.lang) { object.lang = statement.object.land; }

    var exists = target[subject][predicate].some(function (existingObject) {
        return objectEquals(existingObject, object);
    });

    if (!exists) {
        target[subject][predicate].push(object);
    }
};

var mixinDescription = exports.mixinDescription = function (target, mixin) {
    Object.keys(mixin).forEach(function (subject) {
        target[subject] = target[subject] || {};

        Object.keys(mixin[subject]).forEach(function (predicate) {
            target[subject][predicate] = target[subject][predicate] || [];

            mixin[subject][predicate].forEach(function (object) {
                var exists = target[subject][predicate].some(function (existingObject) {
                    return objectEquals(existingObject, object);
                });

                if (!exists) {
                    target[subject][predicate].push(object);
                }
            });
        });
    });
};

var objectEquals = exports.objectEquals = function (lhs, rhs) {
    return (
        lhs.value    === rhs.value &&
        lhs.datatype === rhs.datatype &&
        lhs.lang     === rhs.lang
    );
};

var hashDescription = exports.hashDescription = function (description, cb) {
    serialize(description, 'ntriples', function (err, triples) {
        // sort triples
        var sortedTriples = triples.split('\n').sort().join('\n');
        var hasher = crypto.createHash('md5');

        // hash
        hasher.update(sortedTriples);
        cb(null, hasher.digest().toString('hex'));
    });
};

var toJSONLD = exports.toJSONLD = function (descriptions, context, cb) {
    var ldResult = [];

    Object.keys(descriptions).forEach(function (subject) {
        var ldItem = { '@id': subject };
        Object.keys(descriptions[subject]).forEach(function (predicate) {
            var ldValues = [];
            if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                descriptions[subject][predicate].forEach(function (type) {
                    ldValues.push(type.value);
                });
                ldItem['@type'] = ldValues;
            } else {
                descriptions[subject][predicate].forEach(function (value) {
                    var ldValue = {};
                    switch (value.type) {
                    case 'uri':
                    case 'bnode':
                        ldValue['@id'] = value.value;
                        break;
                    case 'literal':
                        if (value.datatype) { ldValue['@type'] = value.datatype; }
                        else if (value.lang) { ldValue['@language'] = value.lang; }
                        ldValue['@value'] = value.value;
                        break;
                    }
                    ldValues.push(ldValue);
                });
                ldItem[predicate] = ldValues;
            }
        });
        ldResult.push(ldItem);
    });

    jsonld.compact(ldResult, context, {}, cb);
};

var toRDFJSON = exports.toRDFJSON = function (ldDescription, cb) {
    var context = ldDescription['@context'],
        result  = {};

    jsonld.expand(ldDescription, {}, function (err, expanded) {
        if (err) { return cb(err); }

        expanded.forEach(function (frame) {
            var subject = frame['@id'];
            result[subject] = {};

            if (frame['@type']) {
                frame['@type'].forEach(function (type) {
                    result[subject]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] = [{
                        'type': 'uri',
                        'value': type
                    }];
                });
            }

            Object.keys(frame).forEach(function (key) {
                // ignore JSON-LD keywords
                if (key[0] === '@') { return; }

                result[subject][key] = frame[key].map(function (ldValue) {
                    var object = {};

                    if (ldValue['@value']) {
                        object.value = ldValue['@value'];
                        object.type  = 'literal';
                        if (ldValue['@type']) {
                            object.datatype = ldValue['@type'];
                        } else if (ldValue['@language']) {
                            object.lang = ldValue['@language'];
                        }
                    } else if (ldValue['@id']) {
                        object.type  = ldValue['@id'].search(/^_:/) === 0 ? 'bnode' : 'uri';
                        object.value = ldValue['@id'];
                    }

                    return object;
                });
            });
        });

        cb(null, result);
    });
};

var invert = function (object) {
    var inverted = {};
    Object.keys(object).forEach(function (key) {
        inverted[object[key]] = key;
    });
    return inverted;
};
