const navTrigger = document.querySelector( '.nav h1' );
const nav		 = document.querySelector( '.page-nav' );

function toggleMenu() {
	navTrigger.classList.toggle( 'active' );
	nav.classList.toggle( 'active' );
	
	if ( nav.getAttribute( 'aria-hidden' ) == 'true' ) {
		nav.setAttribute( 'aria-hidden', 'false' );
	} else if ( nav.getAttribute( 'aria-hidden' ) == 'false' ) {
		nav.setAttribute( 'aria-hidden', 'true' );
	}
}

navTrigger.setAttribute( 'aria-haspopup', 'true' );
nav.setAttribute( 'aria-hidden', 'true' );
nav.setAttribute( 'aria-label', 'submenu' );

navTrigger.addEventListener( 'click', toggleMenu );