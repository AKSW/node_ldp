var defaults = exports.defaults = {
    server: {
        port: 8001
    }
};

/*
 * JSON-LD context.
 * To support JSON-LD define the context for your vocabulary here.
 * The example context is for the Bob and Alice examples.
 */
var ldContext = exports.ldContext = {
    // properties
    name:      'http://xmlns.com/foaf/0.1/name',
    firstName: 'http://xmlns.com/foaf/0.1/firstName',
    lastName:  'http://xmlns.com/foaf/0.1/lastName',
    birthday:  'http://xmlns.com/foaf/0.1/birthday',
    gender:    'http://xmlns.com/foaf/0.1/gender',
    image:     'http://xmlns.com/foaf/0.1/img',
    blankNode: 'http://webid.example.com/blankNode',
    location:  'http://webid.example.com/location',
    creator:   'http://purl.org/dc/elements/1.1/creator',
    // types
    Person:    'http://xmlns.com/foaf/0.1/Person',
    Image:     'http://xmlns.com/foaf/0.1/Image',
    Document:  'http://xmlns.com/foaf/0.1/Document'
};

/*
 * var ldContext = exports.ldContext = {
 *     title:    'http://purl.org/dc/terms/title',
 *     created:  'http://purl.org/dc/terms/created',
 *     modified: 'http://purl.org/dc/terms/modified',
 *     content:  'http://rdfs.org/sioc/ns#content',
 *     creator:  'http://purl.org/dc/terms/creator',
 *     replies:  'http://rdfs.org/sioc/ns#has_reply',
 *     Comment:  'http://ns.bioasq.org/Comment',
 *     User:     'http://ns.bioasq.org/User',
 *     Question: 'http://ns.bioasq.org/Question'
 * };
 */

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

