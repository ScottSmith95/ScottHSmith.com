'use strict';

const CACHE_VERSION = 'v2018-07-08F'; // Change when major local resources are altered.
const PRECACHE = 'precache-' + CACHE_VERSION;
const RUNTIME = 'runtime-' + CACHE_VERSION;

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
	'/assets/styles/build/partials/global.css'
];

const CACHE_EXCLUDE_URLS = [
	'/index.html',
	'/./', // Alias for index.html,
	'/assets/scripts/build/global.js'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener( 'install', event => {
	event.waitUntil(
		caches.open( PRECACHE )
			.then( cache => cache.addAll( PRECACHE_URLS ) )
			.then( self.skipWaiting() )
	);
} );

// The activate handler takes care of cleaning up old caches.
self.addEventListener( 'activate', event => {
	const currentCaches = [PRECACHE, RUNTIME];
	event.waitUntil(
		caches.keys().then( cacheNames => {
			return cacheNames.filter( cacheName => !currentCaches.includes( cacheName ) );
		} ).then( cachesToDelete => {
			return Promise.all( cachesToDelete.map( cacheToDelete => {
				return caches.delete( cacheToDelete );
			} ) );
		} ).then( () => self.clients.claim() )
	);
} );

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener( 'fetch', event => {

	// Skip cross-origin requests, like those for CDNs or analytics.
	// Only work on dev site.
	if ( event.request.url.startsWith( self.location.origin ) && self.location.hostname === 'dev.scotthsmith.com' ) {

		if ( CACHE_EXCLUDE_URLS.includes( event.request.url.pathname ) ) {
			console.log('Excluded URI.');
			event.respondWith(
				fetch( event.request ).catch( () => {
				   	return caches.match( event.request );
				} )
			  );
		}

		if ( /(\.html?$)|(\/$)/.test( event.request.url.pathname ) ) { // regexp test: https://regexr.com/3of58
			console.log('Getting HTML…');
			event.respondWith(
				caches.open( RUNTIME ).then( cache => {
					return fetch( event.request ).then( response => {
						if( !response || response.status !== 200 || response.type !== 'basic' ) {
							return response;
						}
						// Put a copy of the response in the runtime cache.
						return cache.put( event.request, response.clone() ).then( () => {
							return response;
						} );
					} ).catch( () => {
				   		return caches.match( event.request );
					} )
					;
				} )
			  );
		}

		event.respondWith(
			caches.match( event.request ).then( cachedResponse => {

				if ( cachedResponse ) {
					return cachedResponse;
				}

				return caches.open( RUNTIME ).then( cache => {
					return fetch( event.request ).then( response => {
						if( !response || response.status !== 200 || response.type !== 'basic' ) {
							return response;
						}
						// Put a copy of the response in the runtime cache.
						return cache.put( event.request, response.clone() ).then( () => {
							return response;
						} );
					} );
				} );
			} )
		);
	}
} );
