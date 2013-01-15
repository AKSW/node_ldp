# node_ldp

Implementation of the Linked Data Platform for Node.

## Components

### RDF Middleware

* performs content negotiation
* sets HTTP response header
* parses body into internal canonical format (t.b.s)
* serializes internal canonical format (t.b.s.) to RDF response

### Router

* must determine whether requested resource is resource or container
* must determine whether request is valid

### RDF Store

* check whether resource exists
* get CBD of a given resource
* update an existing resource with RDF change set (?)
* according to LDP working draft, search by predicate not required
  * http://www.w3.org/TR/ldp/
  * what do we need that for?

## Dependencies

### Connect

* http://www.senchalabs.org/connect/
* allows us to plug in RDF middleware
* allows us to plug in WebID auth later

