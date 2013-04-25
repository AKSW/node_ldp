var nodeunit = require('nodeunit'),
    rdf = require('../lib/rdf');

exports.testMixinStatement = nodeunit.testCase({
    'merge into emtpy description': function (test) {
        test.expect(1);

        var base = {};
        var statement = {
            subject: { 'type': 'uri', 'value': 'http://example.com/r1' },
            predicate: { 'type': 'uri', 'value': 'http://example.com/p1' },
            object: { 'type': 'literal', 'value': 'foo bar' }
        };
        var expected = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'literal', 'value': 'foo bar' }
                ]
            }
        };

        rdf.mixinStatement(base, statement);
        test.deepEqual(base, expected);

        test.done();
    },
    'merge into description same statement': function (test) {
        test.expect(1);

        var base = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'literal', 'value': 'foo bar' }
                ]
            }
        };
        var statement = {
            subject: { 'type': 'uri', 'value': 'http://example.com/r1' },
            predicate: { 'type': 'uri', 'value': 'http://example.com/p1' },
            object: { 'type': 'literal', 'value': 'foo bar' }
        };
        var expected = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'literal', 'value': 'foo bar' }
                ]
            }
        };

        rdf.mixinStatement(base, statement);
        test.deepEqual(base, expected);

        test.done();
    },
    'merge into description different object': function (test) {
        test.expect(1);

        var base = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'literal', 'value': 'foo bar' }
                ]
            }
        };
        var statement = {
            subject: { 'type': 'uri', 'value': 'http://example.com/r1' },
            predicate: { 'type': 'uri', 'value': 'http://example.com/p1' },
            object: { 'type': 'typed-literal',
                      'value': 'foo bar baz',
                      'datatype': 'http://www.w3.org/2001/XMLSchema#string' }
        };
        var expected = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'literal', 'value': 'foo bar' },
                    { 'type': 'literal',
                      'value': 'foo bar baz',
                      'datatype': 'http://www.w3.org/2001/XMLSchema#string' }
                ]
            }
        };

        rdf.mixinStatement(base, statement);
        test.deepEqual(base, expected);

        test.done();
    },
});

exports.testMixinDescription = nodeunit.testCase({
    'merge into empty description': function (test) {
        test.expect(1);

        var base = {};
        var description = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'foo'},
                ]
            }
        };

        rdf.mixinDescription(base, description);
        test.deepEqual(base, description);

        test.done();
    },

    'merge descritions with same subject': function (test) {
        test.expect(2);

        var base = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'foo'},
                ]
            }
        };
        var base2 = base;
        var description = {
            'http://example.com/s1': {
                'http://example.com/p2': [
                    { 'type': 'uri', 'value': 'http://example.com/o2'},
                    { 'type': 'literal', 'value': 'bar', 'lang': 'en'},
                ]
            }
        };
        var expected = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'foo'},
                ],
                'http://example.com/p2': [
                    { 'type': 'uri', 'value': 'http://example.com/o2'},
                    { 'type': 'literal', 'value': 'bar', 'lang': 'en'},
                ]
            }
        };

        rdf.mixinDescription(base, description);
        test.deepEqual(base, expected);

        rdf.mixinDescription(description, base2);
        test.deepEqual(base2, expected);

        test.done();
    },
    'merge descritions with same predicate': function (test) {
        test.expect(2);

        var base = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'foo'},
                ]
            }
        };
        var base2 = base;
        var description = {
            'http://example.com/s2': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o2'},
                    { 'type': 'literal', 'value': 'bar', 'lang': 'en'},
                ]
            }
        };
        var expected = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'foo'},
                ],
            },
            'http://example.com/s2': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o2'},
                    { 'type': 'literal', 'value': 'bar', 'lang': 'en'},
                ]
            }
        };

        rdf.mixinDescription(base, description);
        test.deepEqual(base, expected);

        rdf.mixinDescription(description, base2);
        test.deepEqual(base2, expected);

        test.done();
    },
    'merge descritions with same object': function (test) {
        test.expect(2);

        var base = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'same'},
                ]
            }
        };
        var base2 = base;
        var description = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o2'},
                    { 'type': 'literal', 'value': 'bar', 'lang': 'en'},
                    { 'type': 'literal', 'value': 'same'},
                ]
            }
        };
        var expected = {
            'http://example.com/s1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1'},
                    { 'type': 'literal', 'value': 'same'},
                    { 'type': 'uri', 'value': 'http://example.com/o2'},
                    { 'type': 'literal', 'value': 'bar', 'lang': 'en'},
                ],
            }
        };

        rdf.mixinDescription(base, description);
        test.deepEqual(base, expected);

        rdf.mixinDescription(description, base2);
        test.deepEqual(base2, expected);

        test.done();
    },
});

exports.testObjectEquals = nodeunit.testCase({
    'URI object': function (test) {
        test.expect(3);

        var o1 = {
            'type': 'uri',
            'value': 'http://example.com/o1'
        };
        var o2 = {
            'type': 'uri',
            'value': 'http://example.com/o1'
        };
        var o3 = {
            'type': 'uri',
            'value': 'http://example.com/o2'
        };
        var o4 = {
            'type': 'uri',
            'value': 'http://example.com/o2',
            'foo': 'bar'
        };

        test.ok(rdf.objectEquals(o1, o2));
        test.ok(!rdf.objectEquals(o1, o3));
        test.ok(rdf.objectEquals(o3, o4));

        test.done();
    },

    'plain literal': function (test) {
        test.expect(2);

        var o1 = {
            'type': 'literal',
            'value': 'test text'
        };
        var o2 = {
            'type': 'literal',
            'value': 'test text'
        };
        var o3 = {
            'type': 'literal',
            'value': 'other text'
        };

        test.ok(rdf.objectEquals(o1, o2));
        test.ok(!rdf.objectEquals(o1, o3));

        test.done();
    },

    'typed literal': function (test) {
        test.expect(2);

        var o1 = {
            'type': 'typed-literal',
            'value': 'test text',
            'datatype': 'http://www.w3.org/2001/XMLSchema#string'
        };
        var o2 = {
            'type': 'typed-literal',
            'value': 'test text',
            'datatype': 'http://www.w3.org/2001/XMLSchema#string'
        };
        var o3 = {
            'type': 'typed-literal',
            'value': 'test text'
        };

        test.ok(rdf.objectEquals(o1, o2));
        test.ok(!rdf.objectEquals(o1, o3));

        test.done();
    },

    'lang-tagged literal': function (test) {
        test.expect(2);

        var o1 = {
            'type': 'literal',
            'value': 'test text',
            'lang': 'en'
        };
        var o2 = {
            'type': 'literal',
            'value': 'test text',
            'lang': 'en'
        };
        var o3 = {
            'type': 'literal',
            'value': 'other text',
            'lang': 'en_US'
        };

        test.ok(rdf.objectEquals(o1, o2));
        test.ok(!rdf.objectEquals(o1, o3));

        test.done();
    }
});

exports.testHashDescription = nodeunit.testCase({
    'empty descriptions hash to the same value': function (test) {
        test.expect(3);

        rdf.hashDescription({}, function (err, h1) {
            test.equal(null, err);

            rdf.hashDescription({}, function (err, h2) {
                test.equal(null, err);
                test.ok(h1 === h1);

                test.done();
            });
        });
    },

    'simple descriptions hash to the same value': function (test) {
        test.expect(3);

        var d1 = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { type: 'uri', value: 'http://example.com/o1' },
                    { type: 'literal', value: 'value 1' }
                ],
                'http://example.com/p2': [
                    { value: 'ttt', type: 'literal' }
                ]
            }
        };

        var d2 = {
            'http://example.com/r1': {
                'http://example.com/p2': [
                    { type: 'literal', value: 'ttt' }
                ],
                'http://example.com/p1': [
                    { type: 'literal', value: 'value 1' },
                    { type: 'uri', value: 'http://example.com/o1' }
                ]
            }
        };

        rdf.hashDescription(d1, function (err, h1) {
            test.equal(null, err);

            rdf.hashDescription(d2, function (err, h2) {
                test.equal(null, err);
                test.ok(h1 === h1);

                test.done();
            });
        });
    },

    'descriptions using blank nodes with different IDs hash to the same value': function (test) {
        test.expect(3);

        var d1 = {
            'http://example.com/r2': {
                'http://example.com/p3': [
                    { type: 'bnode', value: '_:b12345' }
                ]
            }
        };

        var d2 = {
            'http://example.com/r2': {
                'http://example.com/p3': [
                    { type: 'bnode', value: '_:b6789' }
                ]
            }
        };

        rdf.hashDescription(d1, function (err, h1) {
            test.equal(null, err);

            rdf.hashDescription(d2, function (err, h2) {
                test.equal(null, err);
                test.ok(h1 === h1);

                test.done();
            });
        });
    }
});
