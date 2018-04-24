if ( 'serviceWorker' in navigator && window.location.host == 'dev.scotthsmith.com' ) {
	navigator.serviceWorker.register( '/service-worker.js' )
}
