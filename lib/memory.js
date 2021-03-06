var util = require('util'),
    rdf = require('./rdf');

var Memory = exports.Memory = function Memory() {
    var _descriptions = {};

    function _exists(uri) {
        return (_descriptions[uri] !== undefined);
    }

    function _create(uri) {
        if (!_exists(uri)) { _descriptions[uri] = {}; }
    }

    function _get(uri) {
        return _descriptions[uri];
    }

    function _update(uri, description) {
        _descriptions[uri] = _descriptions[uri] || {};
        rdf.mixinDescription(_descriptions[uri], description);
    }

    function _delete(uri) {
        delete _descriptions[uri];
    }

    function _nodeID(key) {
        return ('_:' + key);
    }

    Memory.prototype.reset = function () {
        _descriptions = {};
    };

    ////////////////////////////////////////////////////////////////////////////
    // Resource-centric interface
    ////////////////////////////////////////////////////////////////////////////

    Memory.prototype.create = function (uri, description, cb) {
        if (_exists(uri)) { return cb(Error('Resource exists.')); }
        _create(uri);
        _update(uri, description);
        if (cb !== undefined) { cb(null); }
    };

    Memory.prototype.exists = function (uri, cb) {
        cb(null, _exists(uri));
    };

    Memory.prototype.get = function (uri, cb) {
        if (!_exists(uri)) { return cb(Error('Not found')); }
        cb(null, _get(uri));
    };

    Memory.prototype.patch = function (uri, add, remove, cb) {
        cb(Error('Not implemented.'));
    };

    Memory.prototype.remove = function (uri, cb) {
        if (!_exists(uri)) { return cb(Error('Not found')); }
        _delete(uri);
        if (cb !== undefined) { cb(null); }
    };

    Memory.prototype.update = function (uri, description, cb) {
        _update(uri, description);
        if (cb !== undefined) { cb(null); }
    };
};
