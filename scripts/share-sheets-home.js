$(document).ready(function(){
	//Adds "iOS" class to body if running iOS
	var device = navigator.userAgent.toLowerCase();
	var ios = device.match(/(iphone|ipod|ipad)/);
		if (ios) {
			$('html').addClass('iOS');
		}
	if (window.location.host == "scottsmith.sexy") {
		$('body').addClass('sexy');
	}
	
	var $sheets = $('#Twitter, #Facebook, #Instagram');
	
	var $triggers = $('.Twitter.ShareSheet, .Facebook.ShareSheet, .Instagram.ShareSheet');
	
	// Shows sheets after they have loaded
	($sheets).delay(300).addClass('loaded');
	
	// Handles opening the Twitter sheet
	$('.Twitter.ShareSheet').click(function() {
		$('#Twitter').toggleClass('selected').toggleClass('unselected');
	});
			
	// Handles opening the Facebook sheet
	$('.Facebook.ShareSheet').click(function() {
		$('#Facebook').toggleClass('selected').toggleClass('unselected');
	});
	
	// Handles opening the Instagram sheet
	$('.Instagram.ShareSheet').click(function() {
		$('#Instagram').toggleClass('selected').toggleClass('unselected');
	});
		
	// Adds "touched" class when element is touched and removes it when it is not
	$('.cancel', $triggers).bind('touchstart touchend', function(e) {
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