$(document).ready(function(){	
	var $images = $('.blue.grid, .dark.grid, .light.grid');
	
	var $downloads = $('.blue .download .dark .download, .light .download');

	$('.blue .download').mouseover(function() {
		$('.selected').removeClass('selected').addClass('unselected');
    	$('.blue.grid').removeClass('unselected').addClass('selected');
    });
    
    $('.dark .download').mouseover(function() {
    	$('.selected').removeClass('selected').addClass('unselected');
    	$('.dark.grid').removeClass('unselected').addClass('selected');
    });
    
    $('.light .download').mouseover(function() {
    	$('.selected').removeClass('selected').addClass('unselected');
    	$('.light.grid').removeClass('unselected').addClass('selected');
    });
});