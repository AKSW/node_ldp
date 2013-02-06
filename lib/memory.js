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

/*
 *     function _description(resourceID) {
 *         if (undefined !== _descriptions[resourceID]) {
 *             return _descriptions[resourceID];
 *         }
 * 
 *         _descriptions[resourceID] = {};
 *         _descriptions[resourceID][resourceID] = {};
 * 
 *         _statements[resourceID].forEach(function (statement) {
 *             if (undefined === _descriptions[resourceID][resourceID]) {
 *                 _descriptions[resourceID][resourceID] = {};
 *             }
 * 
 *             if (undefined === _descriptions[resourceID][resourceID][statement.predicate.value]) {
 * 
 *                 _descriptions[resourceID][resourceID][statement.predicate.value] = [];
 *             }
 * 
 *             var object = {
 *                 type: statement.object.type,
 *                 value: statement.object.value
 *             };
 * 
 *             if (statement.object.datatype) {
 *                 object.datatype = statement.object.datatype;
 *                 object.type = 'literal';    // replace typed-literal
 *             } else if (statement.object.lang) {
 *                 object.lang = statement.object.lang;
 *             }
 * 
 *             _descriptions[resourceID][resourceID][statement.predicate.value].push(object);
 * 
 *             if (statement.object.type === 'bnode') {
 *                 // bNode: recursively merge bNode's description with current resource description
 *                 var nodeDescription = _description(_nodeID(statement.object.value));
 *                 Object.keys(nodeDescription).forEach(function (subject, index, keys) {
 *                     _descriptions[resourceID][subject] = nodeDescription[subject];
 *                 });
 *             }
 *         });
 * 
 *         return _descriptions[resourceID];
 *     }
 */

    Memory.prototype.reset = function () {
        _descriptions = {};
    };

    ////////////////////////////////////////////////////////////////////////////
    // Resource-centric interface
    ////////////////////////////////////////////////////////////////////////////

    Memory.prototype.create = function (uri, description, cb) {
        if (_exists(uri)) { cb(Error('Resource exists.')); }
        _create(uri);
        _update(uri, description);
        if (cb !== undefined) { cb(null); }
    };

    Memory.prototype.find = function (uri, cb) {
        if (!_exists(uri)) { return cb(Error('Not found')); }
        cb(null, _get(uri));
    };

    Memory.prototype.exists = function (uri, cb) {
        cb(null, _exists(uri));
    };

    Memory.prototype.update = function (uri, description, cb) {
        _update(uri, description);
        if (cb !== undefined) { cb(null); }
    };

    Memory.prototype.delete = function (uri, cb) {
        if (!_exists(uri)) { return cb(Error('Not found')); }
        _delete(uri);
        if (cb !== undefined) { cb(null); }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Statement-centric interface
    ////////////////////////////////////////////////////////////////////////////

/*
 *     Memory.prototype.add = function (statement, cb) {
 *         var subject = statement.subject.type === 'uri'
 *                     ? statement.subject.value
 *                     : _nodeID(statement.subject.value);
 * 
 *         if (undefined === _statements[subject]) {
 *             _statements[subject] = [];
 *         }
 *         _statements[subject].push(statement);
 * 
 *         if (cb) { cb(null); }
 *     };
 */

    ////////////////////////////////////////////////////////////////////////////
    // TODO: container interface
    ////////////////////////////////////////////////////////////////////////////
};
