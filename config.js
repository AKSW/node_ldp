var defaults = exports.defaults = {
    server: {
        port: 8001
    },

    context: {
        '@context': {
            'title':    'http://purl.org/dc/terms/title',
            'created':  'http://purl.org/dc/terms/created',
            'modified': 'http://purl.org/dc/terms/modified',
            'content':  'http://rdfs.org/sioc/ns#content',
            'creator':  'http://purl.org/dc/terms/creator',
            'replies':  'http://rdfs.org/sioc/ns#has_reply',
            'Comment:'  'http://ns.bioasq.org/Comment',
            'User':     'http://ns.bioasq.org/User',
            'Question': 'http://ns.bioasq.org/Question'
        }
    }
};

/**
 * Mapping of mime types to raptor parser names.
 */
var typeMapping = exports.typeMapping = {
    'application/rdf+xml':  'rdfxml',
    'text/turtle':          'turtle',
    'application/rdf+json': 'json',
    'application/ld+json':  'jsonld',
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

