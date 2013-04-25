var raptor = require('raptor'),
    crypto = require('crypto'),
    config = require(require('path').join(__dirname, '..', 'config'));

exports.bodyParser = function (options) {
    return function (request, response, next) {
        var type   = request.headers['content-type'],
            format = config.typeMapping[type];

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
