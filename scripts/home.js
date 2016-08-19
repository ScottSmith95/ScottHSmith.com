boomsvgloader.load('/images/Social%20Icons/home-sprite.svg');

function changeSource() {
    var image = document.querySelectorAll('.header-image')[0];
    var source = image.src = image.src.replace('FullPic.jpg', 'SexyScott.jpg');
}

if (window.location.host == 'scottsmith.sexy') {
	document.getElementsByTagName('body')[0].className += ' sexy';
	changeSource();
}


var quotes = [
    "Oh look.<br>A millennial on the Internet.",
    "Fantastic.<br>He's on Twitter.",
	"I have an Instagram.<br>Surprised? Don't be.",
	"Oh you're on Facebook?<br>That's fantastic.",
	"Watch out.<br>I’m on the internet."
];

function randomQuote() {
	var quote = quotes[Math.floor(Math.random() * quotes.length)];

	document.getElementById("social-quote").innerHTML = quote;
}

randomQuote();