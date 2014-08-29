var container = document.querySelector('.items');
var msnry;
imagesLoaded( container, function() {
	msnry = new Masonry( container, {
		itemSelector: '.item-expand-area',
	} );
} );


/*
var msnry = new Masonry( '.items', {
	itemSelector: '.item-expand-area',
} );

imagesLoaded( container, function() {
	msnry.layout();
});
*/