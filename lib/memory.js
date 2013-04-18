const kAnonymousContainerURI = '__anonymous__';

var util = require('util'),
    rdf = require('./rdf');

var Memory = exports.Memory = function Memory() {
    var _descriptions = {};

    function _exists(containerURI, uri) {
        return (_descriptions[containerURI][uri] !== undefined);
    }

    function _create(containerURI, uri) {
        if (!_exists(containerURI, uri)) { _descriptions[containerURI][uri] = {}; }
    }

    function _createContainer(containerURI) {
        if (!_isContainer(containerURI)) { _descriptions[containerURI] = {}; }
    }

    function _get(containerURI, uri) {
        return _descriptions[containerURI][uri];
    }

    function _isContainer(containerURI) {
        return (_descriptions[containerURI] !== undefined);
    }

    function _update(containerURI, uri, description) {
        _descriptions[containerURI][uri] = _descriptions[containerURI][uri] || {};
        rdf.mixinDescription(_descriptions[containerURI][uri], description);
    }

    function _delete(containerURI, uri) {
        delete _descriptions[containerURI][uri];
    }

    function _nodeID(key) {
        return ('_:' + key);
    }

    function _container(containerURI) {
        return {
            /**
             * Create resource with URI and description inside container.
             */
            create: function (uri, description, cb) {
                if (_exists(containerURI, uri)) { cb(Error('Resource exists.')); }
                _create(containerURI, uri);
                _update(containerURI, uri, description);
                if (cb !== undefined) { cb(null); }
            },

            /**
             * Find resource with URI in container.
             */
            find: function (uri, cb) {
                if (!_exists(containerURI, uri)) { return cb(Error('Not found')); }
                cb(null, _get(containerURI, uri));
            },

            /**
             * Check whether resource exists in container.
             */
            exists: function (uri, cb) {
                cb(null, _exists(containerURI, uri));
            },

            /**
             * Update resource in container with description.
             */
            update: function (uri, description, cb) {
                if (!_exists(containerURI, uri)) { return cb(Error('Not found')); }
                _update(containerURI, uri, description);
                if (cb !== undefined) { cb(null); }
            },

            /**
             * Delete resource from container.
             */
            remove: function (uri, cb) {
                if (!_exists(containerURI, uri)) { return cb(Error('Not found')); }
                _delete(containerURI, uri);
                if (cb !== undefined) { cb(null); }
            }
        };
    }

    Memory.prototype.reset = function () {
        _descriptions = {};
    };

    // create anonymous container
    _createContainer(kAnonymousContainerURI);

    ////////////////////////////////////////////////////////////////////////////
    // Resource-centric interface
    ////////////////////////////////////////////////////////////////////////////

    Memory.prototype.create = function (uri, description, cb) {
        if (_exists(kAnonymousContainerURI, uri)) { return cb(Error('Resource exists.')); }
        _create(kAnonymousContainerURI, uri);
        _update(kAnonymousContainerURI, uri, description);
        if (cb !== undefined) { cb(null); }
    };

    Memory.prototype.find = function (uri, cb) {
        if (!_exists(kAnonymousContainerURI, uri)) { return cb(Error('Not found')); }
        cb(null, _get(kAnonymousContainerURI, uri));
    };

    Memory.prototype.exists = function (uri, cb) {
        cb(null, _exists(kAnonymousContainerURI, uri));
    };

    Memory.prototype.update = function (uri, description, cb) {
        _update(kAnonymousContainerURI, uri, description);
        if (cb !== undefined) { cb(null); }
    };

    Memory.prototype.delete = function (uri, cb) {
        if (!_exists(kAnonymousContainerURI, uri)) { return cb(Error('Not found')); }
        _delete(kAnonymousContainerURI, uri);
        if (cb !== undefined) { cb(null); }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Container interface
    ////////////////////////////////////////////////////////////////////////////

    Memory.prototype.createContainer = function (containerURI, cb) {
        if (_isContainer(containerURI)) { return cb(Error('Container exists.')); }
        _createContainer(containerURI);
        cb(null, _container(containerURI));
    };

    Memory.prototype.hasContainer = function (containerURI, cb) {
        cb(null, _isContainer(containerURI));
    };

    Memory.prototype.container = function (containerURI, cb) {
        if (!_isContainer(containerURI)) { return cb(Error('Not a container URI.')); }
        cb(null, _container(containerURI));
    };
};
