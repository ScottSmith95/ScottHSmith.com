$(document).ready(function(){
	$('#current_page').click(function() {
		$('.PageMenu').toggleClass('shown');
		$('.PageMenu').slideToggle('200');
	});
});