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
    })

    return router;
};

