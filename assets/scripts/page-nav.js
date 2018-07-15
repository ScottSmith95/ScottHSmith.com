'use strict';

/*
 * Elements
 */
const navTrigger = document.querySelector( '.nav h1' );
const nav		 = document.querySelector( '.page-nav' );
const navItems   = document.querySelectorAll( '.page-nav li a' );

/*
 * Functions
 */
function toggleMenu( event ) {
	navTrigger.classList.toggle( 'shown' );
	nav.classList.toggle( 'shown' );
	
	// Don't focus element if it was clicked.
	if ( event.type === 'click' ) {
		navTrigger.classList.add( 'clicked' );
	} else {
		navTrigger.classList.remove( 'clicked' );
	}
	
	// Close menu
	if ( nav.getAttribute( 'aria-expanded' ) == 'true' ) {
		nav.setAttribute( 'aria-expanded', 'false' );
		// Set tabindex for each nav list item to -1 to prevent keyboard input while hidden.
		for (let i = 0; i < navItems.length; ++i) { // Iterate through the NodeList.
			let navItem = navItems[i];
			navItem.setAttribute( 'tabindex', '-1' );
		}
	}
	
	// Open menu
	else if ( nav.getAttribute( 'aria-expanded' ) == 'false' ) {
		nav.setAttribute( 'aria-expanded', 'true' );
		// Set tabindex for each nav list item to 0 to allow for natural keyboard input while shown.
		for (let i = 0; i < navItems.length; ++i) { // Iterate through the NodeList.
			let navItem = navItems[i];
			navItem.setAttribute( 'tabindex', '0' );
		}
	}
}

/*
 * Initialisation.
 */
navTrigger.setAttribute( 'aria-haspopup', 'true' );
navTrigger.setAttribute( 'tabindex', '0' );
nav.setAttribute( 'aria-expanded', 'false' );
nav.setAttribute( 'aria-label', 'submenu' );
// Set tabindex for each nav list item to -1 to prevent keyboard input while hidden.
for (let i = 0; i < navItems.length; ++i) { // Iterate through the NodeList.
	let navItem = navItems[i];
	navItem.setAttribute( 'tabindex', '-1' );
}

/*
 * Actions
 */
// navTrigger.addEventListener( 'mousedown', toggleMenu );
navTrigger.addEventListener( 'click', toggleMenu );
navTrigger.addEventListener( 'keydown', event => {
	 if ( (event.keyCode === 13) || (event.keyCode === 32) ) { // 13 = Return, 32 = Space
		toggleMenu( event );
	}
} );
 