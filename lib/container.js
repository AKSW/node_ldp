const kRDFType             = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const kLDPContainer        = 'http://www.w3.org/ns/ldp#Container';
const kMembershipPredicate = 'http://www.w3.org/2000/01/rdf-schema#member';

var rdf = require('./rdf');

/**
 * Adds container interface on top of store interface.
 */
var Container = exports.Container = function (store) {
    var _store = store,
        _containers = {};

    function _add(containerURI, uri) {
        _containers[containerURI][uri] = true;
    }

    function _delete(containerURI) {
        delete _containers[containerURI];
    }

    function _remove(containerURI, uri) {
        delete _containers[containerURI][uri];
    }

    function _create(containerURI) {
        if (!_exists(containerURI)) { _containers[containerURI] = {}; }
    }

    function _get(containerURI) {
        return _containers[containerURI];
    }

    function _exists(containerURI) {
        return (_containers[containerURI] !== undefined);
    }

    function _containerDescription(containerURI) {
        var containerDescription = {};
        containerDescription[containerURI] = {};
        containerDescription[containerURI][kRDFType] = [{
            'type': 'uri',
            'value': kLDPContainer
        }];
        containerDescription[containerURI][kMembershipPredicate] = [];
        Object.keys(_containers[containerURI]).forEach(function (uri) {
            containerDescription[containerURI][kMembershipPredicate].push({
                'type': 'uri',
                'value': uri
            });
        });

        return containerDescription;
    }

    function _container(containerURI) {
        return {
            /**
             * Create resource with URI and description inside current container.
             */
            create: function (uri, description, cb) {
                _store.create(uri, description, function (err) {
                    if (err) { return cb(err); }
                    _add(containerURI, uri);
                    if (cb !== undefined) { cb(null); }
                });
            },

            /**
             * Check whether resource exists in current container.
             */
            exists: function (uri, cb) {
                cb(null, _get(containerURI)[uri] !== undefined);
            },

            get: _store.get,

            /**
             * List resources in the current container.
             */
            list: function (cb) {
                var result = _containerDescription(containerURI);
                Object.keys(_get(containerURI)).forEach(function (uri) {
                    _store.get(uri, function (err, mixin) {
                        if (!err) { rdf.mixinDescription(result, mixin); }
                    });
                });

                cb(null, result);
            },

            /**
             * Delete resource from current container.
             */
            remove: function (uri, cb) {
                _store.remove(uri, function (err) {
                    if (err) { return cb(err); }
                    _remove(containerURI, uri);
                    if (cb !== undefined) { cb(null); }
                });
            },

            update: _store.update
        };
    }

    ////////////////////////////////////////////////////////////////////////////
    // Container interface
    ////////////////////////////////////////////////////////////////////////////

    Container.prototype.createContainer = function (containerURI, cb) {
        if (_exists(containerURI)) { return cb(Error('Container exists.')); }
        _create(containerURI);
        if (cb !== undefined) { cb(null, _container(containerURI)); }
    };

    Container.prototype.getContainer = function (containerURI, cb) {
        if (!_exists(containerURI)) { return cb(Error('Not a container URI.')); }
        cb(null, _container(containerURI));
    };

    Container.prototype.isContainer = function (containerURI, cb) {
        cb(null, _exists(containerURI));
    };

    Container.prototype.removeContainer = function (containerURI, cb) {
        if (!_exists(containerURI)) { return cb(Error('Not a container URI.')); }
        _delete(containerURI);
        if (cb !== undefined) { cb(null); }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Resource-centric interface with container extension
    ////////////////////////////////////////////////////////////////////////////

    Container.prototype.create = function (containerURI, uri, description, cb) {
        if (!containerURI) {
            return _store.create(uri, description, cb);
        }

        if (!_exists(containerURI)) { return cb(Error('Not a container URI.')); }
        return _container(containerURI).create(uri, description, cb);
    };

    Container.prototype.exists = function (containerURI, uri, cb) {
        if (!containerURI) {
            return _store.exists(uri, cb);
        }

        if (!_exists(containerURI)) { return cb(Error('Not a container URI.')); }
        return _container(containerURI).exists(uri, cb);
    };

    Container.prototype.get = _store.get;

    Container.prototype.remove = function (uri, cb) {
        var container;
        var hasContainer = Object.keys(_containers).some(function (containerURI) {
            return Object.keys(_containers[containerURI]).some(function (resourceURI) {
                if (resourceURI === uri) {
                    container = _container(containerURI);
                    return true;
                }
            });
        });

        if (container) { return container.remove(uri, cb); }
        return _store.remove(uri, cb);
    };

    Container.prototype.update = _store.update;
};
