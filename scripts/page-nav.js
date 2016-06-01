var navTrigger = document.querySelector('.nav h1');
var nav        = document.querySelector('.page-nav');

function toggleClass() {
    nav.classList.toggle('active');
}

navTrigger.addEventListener('click', toggleClass)

new Tether({
  element: nav,
  target: navTrigger,
  attachment: 'top left',
  targetAttachment: 'bottom left'
});