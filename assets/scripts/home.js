/*
 * SVG Icons
 */
function loadSvgSprite( url ) {
	fetch( url )
		.then( ( response ) => response.text() )
		.then( ( spriteText ) => {
			const div = document.createElement( 'div' );
			div.style.cssText = 'border: 0; clip: rect(0 0 0 0); height: 0; overflow: hidden; padding: 0; position: absolute; width: 0;';
			div.innerHTML = spriteText;
			document.body.insertBefore(div, document.body.childNodes[0]);
		} );
}

loadSvgSprite( '/assets/images/social-icons/build/home-sprite.svg' );


/*
 * Quotes
 */
var quotes = [
    "Oh look. <br>A millennial on the Internet.",
    "Fantastic. <br>Another white guy on Twitter.",
	"I have an Instagram. <br>Surprised? Don't be.",
	"Oh you're on Facebook? <br>That's fantastic.",
	"Watch out. <br>I’m on the internet.",
	"Who has two thumbs and a LinkedIn? <br>This guy.",
	"Follow me—<br>or else&hellip;"
];

function randomQuote() {
	var quoteEl = document.getElementById( 'social-quote' ),
		quote = quotes[ Math.floor( Math.random() * quotes.length ) ];

	quoteEl.innerHTML = quote;
}

randomQuote();


/*
 * Colophon
 */
const colophonTrigger = document.querySelector( 'button.colophon-extender' );
const colophonExt = document.querySelector( '.colophon-extended' );

function toggleColophon() {
	colophonTrigger.classList.toggle( 'shown' );
	colophonExt.classList.toggle( 'shown' );

	if ( colophonTrigger.getAttribute( 'aria-expanded' ) == 'true' ) {
		colophonTrigger.setAttribute( 'aria-expanded', 'false' );
		colophonTrigger.innerHTML = 'Show More&hellip;';
	} else if ( colophonTrigger.getAttribute( 'aria-expanded' ) == 'false' ) {
		colophonTrigger.setAttribute( 'aria-expanded', 'true' );
		colophonTrigger.innerHTML = 'Show Less&hellip;';
	}
}

colophonTrigger.setAttribute( 'aria-expanded', 'false' );
colophonTrigger.setAttribute( 'aria-controls', 'colophon-extended' );

colophonTrigger.addEventListener( 'click', toggleColophon );


/*
 * ScottSmith.sexy
 */
function changeSource() {
	var image = document.querySelector( '.header-image' );
	image.src = image.src.replace( 'header-image/jpeg/1120.jpg', 'SexyScott.jpg' );
	image.removeAttribute( 'srcset' );
	image.parentNode.querySelector( 'source' ).remove();
}

if ( window.location.host == 'scottsmith.sexy' ) {
	document.querySelector( 'body' ).classList.add( 'sexy' );
	changeSource();
}
