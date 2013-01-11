var defaults = exports.defaults = {
    server: {
        port: 8001
    }
};

/**
 * Mapping of mime types to raptor parser names.
 */
var typeMapping = exports.typeMapping = {
    'application/rdf+xml':  'rdfxml', 
    'text/turtle':          'turtle', 
    'application/rdf+json': 'json', 
    'text/plain':           'ntriples', 
    '*/*':                  'turtle'
};

/**
 * Mapping of mime types to output providers.
 */
var outputMapping = exports.outputMapping = {
    'application/rdf+xml':  'rdf',
    'text/turtle':          'rdf',
    'application/rdf+json': 'rdf',
    'text/plain':           'rdf',
    'text/html':            'html',
    'application/xml':      'html',
    '*/*':                  'rdf'
};

