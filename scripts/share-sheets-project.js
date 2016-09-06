var sheets = document.querySelectorAll('.Sheet');
var triggers = [document.querySelector('.Twitter'), document.querySelector('.Facebook')];

// Shows sheets after they have loaded.
setTimeout(function(){
	// Iterate through the NodeList.
	for (var i = 0; i < sheets.length; ++i) {
		sheets[i].classList.add('loaded');
	}
});

// Handles opening the sheets.
function toggleSheet(sheetID) {
	sheet = document.querySelector(sheetID);
	
	if ( sheet.classList.contains('selected') ) {
		sheet.classList.remove('selected');
		sheet.classList.add('unselected');
		sheet.blur();
		
		offDarkLayer();
	}
	else {
		sheet.classList.add('selected');
		sheet.classList.remove('unselected');
		sheet.focus();
		
		onDarkLayer();
	}
}

// Handles adding `<div class="darklayer"></div>` to DOM.
function addDarklayer() {
	var element = document.createElement("div");
	element.setAttribute('class', 'darklayer off');
	document.body.appendChild(element);
}

function onDarkLayer() {
	var darkLayer = document.querySelector('.darklayer');
	darkLayer.classList.add('loaded');
	darkLayer.classList.remove('off');
	darkLayer.classList.add('on');
}

function offDarkLayer() {
	darkLayer = document.querySelector('.darklayer');
	darkLayer.classList.remove('on');
	darkLayer.classList.add('off');
}

// Close selected sheet and turn darklayer off.
function offSelectedSheet() {
	selectedSheet = document.querySelector('.Sheet.selected');
	selectedSheet.blur();
	selectedSheet.classList.remove('selected');
	selectedSheet.classList.add('unselected');
	
	offDarkLayer();
}

// Link triggers to sheets.
document.querySelector('.Twitter').addEventListener('click', function() {
	toggleSheet('#Twitter');
});
document.querySelector('.Facebook').addEventListener('click', function() {
	toggleSheet('#Facebook');
});

// Add dark layer to DOM.
addDarklayer();

// Adds "touched" class when element is touched and removes it when it is not.
cancelBtns = document.querySelectorAll('.cancel');
cancelBtns = Array.prototype.slice.call(cancelBtns);

Array.prototype.forEach.call(cancelBtns, function(element, i){
	element.addEventListener('touchstart', function(element) {
		element.classList.add('touched');
	});
	
	element.addEventListener('touchend', function(element) { 
		element.classList.remove('touched');
	});
});


// Triggers un-darkening rest of page and deselecting sheets.
var cancelBtns = document.querySelectorAll('.cancel');
var darkLayer = document.querySelector('.darklayer');

// Convert NodeList into an array.
closers = Array.prototype.slice.call(cancelBtns);
closers.push(darkLayer);

Array.prototype.forEach.call(closers, function(element, i){
	element.addEventListener('click', function(element) {
		offSelectedSheet();
	});
});