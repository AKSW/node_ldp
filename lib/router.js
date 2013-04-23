var Crystal = require('./crystal').Crystal,
    Container = require('./container').Container;

exports.createRouter = function (options, store) {
    var router = new Crystal(options),
        container = new Container(store);

    router.map(function () {
        /*
         * POST to URI returns resource or 404.
         */
        this.get(function (request, response, uri) {
            container.get (uri, function (err, description) {
                if (err) {
                    container.getContainer(uri, function (err, cont) {
                        if (err) {
                            response.send(404);
                        } else {
                            cont.list(function (err, list) {
                                if (err) {
                                    response.send(500);
                                } else {
                                    response.send(200, {}, list);
                                }
                            });
                        }
                    });
                } else {
                    response.send(200, {}, description);
                }
            });
        });

        /*
         * HEAD to uri returns same headers as GET w/o content.
         */
        this.head(function (request, response, uri) {
            store.exists(uri, function (err, exists) {
                if (exists) {
                    response.send(200, { 'Allow': 'GET, HEAD, POST, DELETE' });
                } else {
                    container.isContainer(uri, function (err, isContainer) {
                        if (isContainer) {
                            response.send(200, { 'Allow': 'GET, POST, DELETE' });
                        } else {
                            response.send(404, { 'Allow': 'PUT, POST' } );
                        }
                    });
                }
            });
        });

        /*
         * DELETE to uri deletes resource.
         */
        this.delete(function (request, response, uri) {
            container.remove(uri, function (err) {
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
                    container.isContainer(uri, function (isContainer) {
                        if (!isContainer) {
                            store.create(uri, request.body);
                            response.send(201, { 'Location': uri });
                        } else {
                            response.send(405, { 'Allow': 'GET, POST, DELETE' });
                        }
                    });
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
            container.isContainer(uri, function (err, isContainer) {
                if (isContainer) {
                    // TODO: create nice URI
                    var resourceURI = uri + '/' + String(Date.now());
                    container.exists(uri, resourceURI, function (err, exists) {
                        if (!exists) {
                            container.create(uri, request.body);
                            response.send(201, { 'Location': uri });
                        } else {
                            store.update(uri, request.body);
                            response.send(204);
                        }
                    });
                } else {
                    if (!request.body.hasOwnProperty(uri)) {
                        return response.send(400);
                    }
                    container.exists(null, uri, function (err, exists) {
                        if (!exists) {
                            store.create(uri, request.body);
                            response.send(201, { 'Location': uri });
                        } else {
                            store.update(uri, request.body);
                            response.send(204);
                        }
                    });
                }
            });
        });
    });

    return router;
};

