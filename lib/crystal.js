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
        var handler = this.handlers[request.method];
        var host    = this.options.fakeNamespace
                    ? this.options.fakeNamespace.replace(/\/$/, '')
                    : request.protocol + '://' + request.headers.host;
        request.headers.host = host;
        request.url = url.parse(request.url);
        var self = this;
        if (handler) {
            var respond = {
                send: function (status, headers, body) {
                    /*
                     * Mimic Node's ServerResponse while allowing us
                     * to do stuff before it is actually sent.
                     */
                    return self.respond({
                        status: status || 200,
                        headers: headers || {},
                        body: body || ''
                    }, cb);
                }
            }
            try {
                handler.call(this, request, respond, host + request.url.pathname);
            } catch (err) {
                console.log('Error while running handler: ' + err.stack);
                return self.respond({
                    status: 500,
                    body: 'Internal server error',
                }, cb);
            }
        } else {
            return self.respond({
                status: 501,
                body: 'Not implemented'
            }, cb);
        }
    },

    respond: function (result, cb) {
        // Add default headers
        result.headers           = result.headers || {};
        result.headers['Date']   = (new Date).toUTCString();
        result.headers['Server'] = 'Crystal/0.1';
        return cb(result);
    }
};

