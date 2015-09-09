var menuTrigger = document.querySelector('#current_page');
var menu        = document.querySelector('.PageMenu');

function toggleClass(){
    menu.classList.toggle('active');
}

menuTrigger.addEventListener('click', toggleClass )