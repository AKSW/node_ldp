var Crystal = require('./crystal').Crystal;

exports.createRouter = function (options, store) {
    var router = new Crystal(options);

    router.map(function () {
        this.get(function (request, response, uri) {
            store.find(uri, function (err, result) {
                if (err) {
                    response.send(404);
                } else {
                    response.send(200, {}, result);
                }
            });
        });

        this.head(function (request, response, uri) {
            store.exists(uri, function (err, exists) {
                if (exists) {
                    response.send(200, { 'Allowed': 'GET' });
                } else {
                    response.send(404, { 'Allowed': 'PUT' });
                }
            });
        });
    })

    return router;
};

