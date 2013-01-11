var merge = exports.merge = function (target/* variadic arguments */) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.forEach(function (a) {
        var keys = Object.keys(a);
        for (var i = 0; i < keys.length; i++) {
            target[keys[i]] = a[keys[i]];
        }
    });
    return target;
}
