var elem = document.querySelector('.grid-carousel');
var flkty = new Flickity( elem, {
  imagesLoaded: true,
  lazyLoad: 1
});

document.querySelector('.blue .download').addEventListener( 'mouseover', function() {
	flkty.select( 0 );
}, false );

document.querySelector('.dark .download').addEventListener( 'mouseover', function() {
	flkty.select( 1 );
}, false );

document.querySelector('.light .download').addEventListener( 'mouseover', function() {
	flkty.select( 2 );
}, false );
