var nodeunit = require('nodeunit'),
    Memory = require('../lib/memory').Memory;

exports.testCreateGetExists = nodeunit.testCase({
    'create empty resource': function (test) {
        test.expect(7);

        var store = new Memory(),
            uri = 'http://example.com/r1';

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, {}, function (err) {
                test.equal(null, err);

                store.exists(uri, function (err, exists) {
                    test.equal(null, err);
                    test.equal(true, exists);

                    store.get(uri, function (err, result) {
                        test.equal(null, err);
                        test.deepEqual({}, result);
                        test.done();
                    });
                });
            });
        });
    },

    'create simple resource': function (test) {
        test.expect(7);

        var expected = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1' },
                    { 'type': 'bnode', 'value': '_:123' },
                    { 'type': 'literal', 'value': 'ttt' }
                ]
            }
        };

        var store = new Memory(),
            uri = 'http://example.com/r1';

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, expected, function (err) {
                test.equal(null, err);

                store.exists(uri, function (err, exists) {
                    test.equal(null, err);
                    test.equal(true, exists);

                    store.get(uri, function (err, result) {
                        test.equal(null, err);
                        test.deepEqual(expected, result);
                        test.done();
                    });
                });
            });
        });
    }
});

exports.testUpdate = nodeunit.testCase({
    'create empty and update empty': function (test) {
        test.expect(8);
        var store = new Memory(),
            uri = 'http://example.com/r1';

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, {}, function (err) {
                test.equal(null, err);

                store.get(uri, function (err, result) {
                    test.equal(null, err);
                    test.deepEqual({}, result);

                    store.update(uri, {}, function (err) {
                        test.equal(null, err);

                        store.get(uri, function (err, result) {
                            test.equal(null, err);
                            test.deepEqual({}, result);
                            test.done();
                        });
                    });
                });
            });
        });
    },

    'create empty and update simple': function (test) {
        test.expect(8);
        var store = new Memory(),
            uri = 'http://example.com/r1';

        var init = {};
        var update = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1' },
                    { 'type': 'bnode', 'value': '_:123' },
                    { 'type': 'literal', 'value': 'ttt' }
                ]
            }
        };

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, init, function (err) {
                test.equal(null, err);

                store.get(uri, function (err, result) {
                    test.equal(null, err);
                    test.deepEqual(init, result);

                    store.update(uri, update, function (err) {
                        test.equal(null, err);

                        store.get(uri, function (err, result) {
                            test.equal(null, err);
                            test.deepEqual(update, result);
                            test.done();
                        });
                    });
                });
            });
        });
    },

    'create simple and update empty': function (test) {
        test.expect(8);
        var store = new Memory(),
            uri = 'http://example.com/r1';

        var init = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1' },
                    { 'type': 'bnode', 'value': '_:123' },
                    { 'type': 'literal', 'value': 'ttt' }
                ]
            }
        };
        var update = {};

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, init, function (err) {
                test.equal(null, err);

                store.get(uri, function (err, result) {
                    test.equal(null, err);
                    test.deepEqual(init, result);

                    store.update(uri, update, function (err) {
                        test.equal(null, err);

                        store.get(uri, function (err, result) {
                            test.equal(null, err);
                            test.deepEqual(init, result);
                            test.done();
                        });
                    });
                });
            });
        });
    },

    'create simple and update simple': function (test) {
        test.expect(8);
        var store = new Memory(),
            uri = 'http://example.com/r1';

        var init = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1' },
                    { 'type': 'bnode', 'value': '_:123' },
                    { 'type': 'literal', 'value': 'ttt' }
                ]
            }
        };
        var update = {
            'http://example.com/r1': {
                'http://example.com/p2': [
                    { 'type': 'uri', 'value': 'http://example.com/o2' },
                    { 'type': 'literal', 'value': 'vvv' },
                    { 'type': 'bnode', 'value': '_:abc' }
                ]
            }

        };

        var expected = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1' },
                    { 'type': 'bnode', 'value': '_:123' },
                    { 'type': 'literal', 'value': 'ttt' }
                ],
                'http://example.com/p2': [
                    { 'type': 'uri', 'value': 'http://example.com/o2' },
                    { 'type': 'literal', 'value': 'vvv' },
                    { 'type': 'bnode', 'value': '_:abc' }
                ]
            }
        };

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, init, function (err) {
                test.equal(null, err);

                store.get(uri, function (err, result) {
                    test.equal(null, err);
                    test.deepEqual(init, result);

                    store.update(uri, update, function (err) {
                        test.equal(null, err);

                        store.get(uri, function (err, result) {
                            test.equal(null, err);
                            test.deepEqual(expected, result);
                            test.done();
                        });
                    });
                });
            });
        });
    }
});

exports.testRemove = nodeunit.testCase({
    'create and remove empty': function (test) {
        test.expect(10);

        var store = new Memory(),
            uri = 'http://example.com/r1';

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, {}, function (err) {
                test.equal(null, err);

                store.exists(uri, function (err, exists) {
                    test.equal(null, err);
                    test.equal(true, exists);

                    store.get(uri, function (err, result) {
                        test.equal(null, err);
                        test.deepEqual({}, result);

                        store.remove(uri, function (err) {
                            test.equal(null, err);

                            store.exists(uri, function (err, exists) {
                                test.equal(null, err);
                                test.equal(false, exists);
                                test.done();
                            });
                        });
                    });
                });
            });
        });
    },

    'create and remove simple': function (test) {
        test.expect(10);

        var store = new Memory(),
            uri = 'http://example.com/r1';

        var expected = {
            'http://example.com/r1': {
                'http://example.com/p1': [
                    { 'type': 'uri', 'value': 'http://example.com/o1' },
                    { 'type': 'bnode', 'value': '_:123' },
                    { 'type': 'literal', 'value': 'ttt' }
                ]
            }
        };

        store.exists(uri, function (err, exists) {
            test.equal(null, err);
            test.equal(false, exists);

            store.create(uri, expected, function (err) {
                test.equal(null, err);

                store.exists(uri, function (err, exists) {
                    test.equal(null, err);
                    test.equal(true, exists);

                    store.get(uri, function (err, result) {
                        test.equal(null, err);
                        test.deepEqual(expected, result);

                        store.remove(uri, function (err) {
                            test.equal(null, err);

                            store.exists(uri, function (err, exists) {
                                test.equal(null, err);
                                test.equal(false, exists);
                                test.done();
                            });
                        });
                    });
                });
            });
        });
    }
});
