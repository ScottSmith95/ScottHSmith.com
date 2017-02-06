boomsvgloader.load('/images/Social%20Icons/home-sprite.svg');

/* Quotes */
var quotes = [
    "Oh look. <br>A millennial on the Internet.",
    "Fantastic. <br>Another guy on Twitter.",
	"I have an Instagram. <br>Surprised? Don't be.",
	"Oh you're on Facebook? <br>That's fantastic.",
	"Watch out. <br>I’m on the internet.",
	"Eminent. Employable. <br>LinkedIn equipped."
];

function randomQuote() {
	var quoteEl = document.getElementById("social-quote"),
		quote = quotes[Math.floor(Math.random() * quotes.length)];
		
	quoteEl.innerHTML = quote;
}

randomQuote();

/* ScottSmith.sexy */
function changeSource() {
    var image = document.querySelector('.header-image');
    image.src = image.src.replace('header-image/1120.jpg', 'SexyScott.jpg');
    image.removeAttribute('srcset');
}

if (window.location.host == 'scottsmith.sexy') {
	document.querySelector('body').classList.add('sexy');
	changeSource();
}