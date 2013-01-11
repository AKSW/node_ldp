var Memory = exports.Memory = function Memory() {
    var _statements = {};
    var _descriptions = {};

    function _exists(key) {
        return (undefined !== _statements[key]);
    }

    function _nodeID(key) {
        return ('_:' + key);
    }

    function _description(resourceID) {
        if (undefined !== _descriptions[resourceID]) {
            return _descriptions[resourceID];
        }

        _descriptions[resourceID] = {};
        _descriptions[resourceID][resourceID] = {};

        _statements[resourceID].forEach(function (statement) {
            if (undefined === _descriptions[resourceID][resourceID]) {
                _descriptions[resourceID][resourceID] = {};
            }

            if (undefined === _descriptions[resourceID][resourceID][statement.predicate.value]) {
                _descriptions[resourceID][resourceID][statement.predicate.value] = [];
            }
            
            var object = {
                type: statement.object.type,
                value: statement.object.value
            };

            if (statement.object.datatype) {
                object.datatype = statement.object.datatype;
                object.type = 'literal';    // replace typed-literal
            } else if (statement.object.lang) {
                object.lang = statement.object.lang;
            }

            _descriptions[resourceID][resourceID][statement.predicate.value].push(object);

            if (statement.object.type === 'bnode') {
                // bNode: recursively merge bNode's description with current resource description
                var nodeDescription = _description(_nodeID(statement.object.value));
                Object.keys(nodeDescription).forEach(function (subject, index, keys) {
                    _descriptions[resourceID][subject] = nodeDescription[subject];
                });
            }
        });

        return _descriptions[resourceID];
    }

    function _update(uri, patch) {
        // TODO:
    }

    Memory.prototype.reset = function () {
    };

    Memory.prototype.find = function (uri, cb) {
        if (!_exists(uri)) {
            cb('Not found');
        } else {
            cb(null, _description(uri));
        }
    };

    Memory.prototype.exists = function (uri, cb) {
        cb(null, _exists(uri));
    };

    Memory.prototype.update = function (uri, patch, cb) {
        _update(uri, patch);
        cb(null);
    };

    Memory.prototype.add = function (statement, cb) {
        var subject = statement.subject.type === 'uri'
                                ? statement.subject.value 
                                : _nodeID(statement.subject.value);

        if (undefined === _statements[subject]) {
            _statements[subject] = [];
        }
        _statements[subject].push(statement);

        if (cb) { cb(null); }
    };
};
