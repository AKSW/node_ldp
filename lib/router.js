var Crystal = require('./crystal').Crystal;

exports.createRouter = function (options, store) {
    var router = new Crystal(options);

    router.map(function () {

        /*
         * POST to URI returns resource or 404.
         */
        this.get(function (request, response, uri) {
            store.find(uri, function (err, result) {
                if (err) {
                    response.send(404);
                } else {
                    response.send(200, {}, result);
                }
            });
        });

        /*
         * HEAD to uri returns same headers as GET w/o content.
         */
        this.head(function (request, response, uri) {
            store.exists(uri, function (err, exists) {
                if (exists) {
                    response.send(200);
                } else {
                    response.send(404);
                }
            });
        });

        /*
         * DELETE to uri deletes resource.
         */
        this.delete(function (request, response, uri) {
            store.delete(uri, function (err) {
                if (err) {
                    response.send(404);
                } else {
                    response.send(200);
                }
            });
        });

        /*
         * PUT to uri creates resource, replacing an old one if necessary.
         */
        this.put(function (request, response, uri) {
            if (!request.body.hasOwnProperty(uri)) {
                return response.send(400);
            }
            store.exists(uri, function (err, exists) {
                if (!exists) {
                    store.create(uri, request.body);
                    response.send(201, { 'Location': uri });
                } else {
                    store.delete(uri, function (err) {
                        store.create(uri, request.body);
                        response.send(204);
                    });
                }
            });
        });

        /*
         * POST to uri creates resource, updating an old one if it exists.
         */
        this.post(function (request, response, uri) {
            if (!request.body.hasOwnProperty(uri)) {
                return response.send(400);
            }
            store.exists(uri, function (err, exists) {
                if (!exists) {
                    store.create(uri, request.body);
                    response.send(201, { 'Location': uri });
                } else {
                    store.update(uri, request.body);
                    response.send(204);
                }
            });
        });
    });

    return router;
};

