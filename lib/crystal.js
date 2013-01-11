var url = require('url');

/*
 * A simple method-based router, inspired by 
 * [https://github.com/cloudhead/journey](Journey).
 */
exports.Crystal = function Crystal(options) {
    this.handlers = {};
    this.options = options || {};
};

exports.Crystal.prototype = {
    // Allow defining method handlers uing `this`.
    map: function (routes) {
        routes.call(this);
    },

    // Routing shortcuts
    get:    function (cb) { return this.route('GET',    cb); },
    post:   function (cb) { return this.route('POST',   cb); },
    put:    function (cb) { return this.route('PUT',    cb); },
    delete: function (cb) { return this.route('DELETE', cb); },
    head:   function (cb) { return this.route('HEAD',   cb); },
    patch:  function (cb) { return this.route('PATCH',  cb); },

    // Store a method handler
    route: function (method, cb) {
        this.handlers[method] = cb;
    },

    // Handle a request
    handle: function (request, cb) {
        var result  = {};
        var handler = this.handlers[request.method];
        var host    = this.options.fakeNamespace
                    ? this.options.fakeNamespace.replace(/\/$/, '')
                    : request.headers.host;
        request.headers.host = host;
        request.url = url.parse(request.url);
        if (handler) {
            var respond = {
                send: function (status, headers, body) {
                    return cb({
                        status: status || 200,
                        headers: headers || {},
                        body: body || ''
                    });
                }
            }
            try {
                handler.call(this, request, respond, host + request.url.pathname);
                /*
                 * return cb({
                 *     status: result.status || 200,
                 *     headers: result.headers || {},
                 *     body: result.body || ''
                 * });
                 */
            } catch (err) {
                return cb({
                    status: 500,
                    body: String(err),
                    stack: err.stack
                });
            }
        } else {
            return cb({
                status: 501,
                body: 'Not implemented'
            });
        }
        return result;
    }
};

