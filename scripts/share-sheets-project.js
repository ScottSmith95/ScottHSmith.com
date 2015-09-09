$(document).ready(function(){		
	var $sheets = $('#Twitter, #Facebook');
	
	var $triggers = $('.Twitter, .Facebook');
	
	// Shows sheets after they have loaded
	($sheets).delay(300).addClass('loaded');
	$('.darklayer').delay(300).addClass('loaded');
	
	// Handles opening the Twitter sheet
	$('.Twitter').click(function() {
		$('#Twitter').toggleClass('selected').toggleClass('unselected');
	});
			
	// Handles opening the Facebook sheet
	$('.Facebook').click(function() {
		$('#Facebook').toggleClass('selected').toggleClass('unselected');
	});
	
	// Adds "touched" class when element is touched and removes it when it is not
	$('.cancel').bind('touchstart touchend', function(e) {
		$(this).toggleClass('touched');
	});
	
	// Add dark layer to DOM
	$('body').append($('<div>', {class: 'darklayer off'}));
	
	// Handles darkening rest of page
	($triggers).click(function() {
		$('.darklayer').addClass('on').removeClass('off').addClass('loaded');
	});
	
	// Triggers un-darkening rest of page and deselecting sheets
	$('.cancel, .darklayer').click(function() {
		$('.Sheet.selected').removeClass('selected').addClass('unselected');
		$('.darklayer').removeClass('on').addClass('off');
	});
});