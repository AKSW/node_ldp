const kRDFType             = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const kLDPContainer        = 'http://www.w3.org/ns/ldp#Container';
const kMembershipPredicate = 'http://www.w3.org/2000/01/rdf-schema#member';

var nodeunit = require('nodeunit'),
    Memory = require('../lib/memory').Memory,
    Container = require('../lib/container').Container;

exports.testCreateContainer = nodeunit.testCase({
    'create container': function (test) {
        test.expect(5);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container1/';

        container.isContainer(containerURI, function (err, exists) {
            test.equals(null, err);
            test.equals(false, exists);

            container.createContainer(containerURI, function (err) {
                test.equals(null, err);

                container.isContainer(containerURI, function (err, exists) {
                    test.equals(null, err);
                    test.ok(exists);
                    test.done();
                });
            });
        });
    },

    'create container that exists': function (test) {
        test.expect(6);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container2/';

        container.isContainer(containerURI, function (err, exists) {
            test.equals(null, err);
            test.equals(false, exists);

            container.createContainer(containerURI, function (err) {
                test.equals(null, err);

                container.isContainer(containerURI, function (err, exists) {
                    test.equals(null, err);
                    test.ok(exists);

                    container.createContainer(containerURI, function (err) {
                        test.notEqual(null, err);
                        test.done();
                    });
                });
            });
        });
    }
});

exports.testGetContainer = nodeunit.testCase({
    'get existing container': function (test) {
        test.expect(3);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container3/';

        container.createContainer(containerURI, function (err) {
            test.equal(null, err);

            container.getContainer(containerURI, function (err, result) {
                test.equal(null, err);
                test.notEqual(null, result);
                test.done();
            });
        });
    },

    'get non-existing container': function (test) {
        test.expect(4);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container4/';

        container.getContainer(containerURI, function (err) {
            test.notEqual(null, err);

            container.createContainer(containerURI, function (err) {
                test.equal(null, err);

                container.getContainer(containerURI, function (err, result) {
                    test.equal(null, err);
                    test.notEqual(null, result);
                    test.done();
                });
            });
        });
    }
});

exports.testIsContainer = nodeunit.testCase({
    'test existing container': function (test) {
        test.expect(3);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container5/';

        container.createContainer(containerURI, function (err) {
            test.equal(null, err);

            container.isContainer(containerURI, function (err, isContainer) {
                test.equal(null, err);
                test.ok(isContainer);
                test.done();
            });
        });
    },

    'test non-existing container': function (test) {
        test.expect(4);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container6/';

        container.isContainer(containerURI, function (err, isContainer) {
            test.equal(false, isContainer);

            container.createContainer(containerURI, function (err) {
                test.equal(null, err);

                container.isContainer(containerURI, function (err, isContainer) {
                    test.equal(null, err);
                    test.ok(isContainer);
                    test.done();
                });
            });
        });
    }
});

exports.testRemoveContainer = nodeunit.testCase({
    'remove existing container': function (test) {
        test.expect(2);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container7/';

        container.createContainer(containerURI, function (err) {
            test.equal(null, err);

            container.removeContainer(containerURI, function (err) {
                test.equal(null, err);
                test.done();
            });
        });
    },

    'remove non-existing container': function (test) {
        test.expect(3);

        var store = new Memory(),
            container = new Container(store);

        var containerURI = 'http://example.com/container8/';

        container.removeContainer(containerURI, function (err, isContainer) {
            test.notEqual(null, err);

            container.createContainer(containerURI, function (err) {
                test.equal(null, err);

                container.removeContainer(containerURI, function (err) {
                    test.equal(null, err);
                    test.done();
                });
            });
        });
    }
});

exports.testCreateExists = nodeunit.testCase({
    setUp: function (cb) {
        this.container = new Container(new Memory());
        cb();
    },

    'create resource in existing container': function (test) {
        test.expect(4);

        var containerURI = 'http://example.com/container9/',
            resourceURI  = 'http://example.com/container9/resource1';

        var self = this;

        self.container.createContainer(containerURI, function (err) {
            test.equal(null, err);

            self.container.create(containerURI, resourceURI, {}, function (err) {
                test.equal(null, err);

                self.container.exists(containerURI, resourceURI, function (err, resourceExists) {
                    test.equal(null, err);
                    test.ok(resourceExists);

                    test.done();
                });
            });
        });
    },

    'create resource in non-existing container': function (test) {
        test.expect(2);

        var containerURI = 'http://example.com/container10/',
            resourceURI  = 'http://example.com/container10/resource1';

        var self = this;

        self.container.create(containerURI, resourceURI, {}, function (err) {
            test.notEqual(null, err);

            self.container.exists(null, resourceURI, function (err, resourceExists) {
                test.equal(false, resourceExists);

                test.done();
            });
        });
    }
});

exports.testRemove = nodeunit.testCase({
    setUp: function (cb) {
        this.container = new Container(new Memory());
        cb();
    },

    'remove deletes resource from container': function (test) {
        test.expect(5);

        var containerURI = 'http://example.com/container11/',
            resourceURI  = 'http://example.com/container11/resource1';

        var self = this;

        self.container.createContainer(containerURI, function (err) {
            test.equal(null, err);

            self.container.create(containerURI, resourceURI, {}, function (err) {
                test.equal(null, err);

                self.container.remove(resourceURI, function (err) {
                    test.equal(null, err);

                    self.container.exists(containerURI, resourceURI, function (err, resourceExists) {
                        test.equal(null, err);
                        test.equal(false, resourceExists);

                        test.done();
                    });
                });
            });
        });
    }
});

exports.testContainerInterface = nodeunit.testCase({
    setUp: function (cb) {
        this.container = new Container(new Memory());
        this.containerURI = 'http://example.com/container12/';
        var self = this;
        this.container.createContainer(this.containerURI, function (err, containerInterface) {
            self.containerInterface = containerInterface;
            cb();
        });
    },
    
    'list container resources': function (test) {
        test.expect(5);
        var self = this;
        var resourceURI = 'http://example.com/container12/resource1';

        self.containerInterface.create(resourceURI, {}, function (err) {
            test.equal(null, err);

            self.containerInterface.exists(resourceURI, function (err, resourceExists) {
                test.equal(null, err);
                test.ok(resourceExists);

                self.containerInterface.list(function (err, contents) {
                    test.equal(null, err);
                    test.ok(contents[self.containerURI][kMembershipPredicate].map(function (object) {
                        return object.value;
                    }).indexOf(resourceURI) > -1);
                    test.done();
                });
            });
        });
    }
});
