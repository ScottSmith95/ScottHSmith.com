boomsvgloader.load('/images/Social%20Icons/home-sprite.svg');

function changeSource() {
    var image = document.querySelectorAll('.header-image')[0];
    var source = image.src = image.src.replace('FullPic.jpg', 'SexyScott.jpg');
}

if (window.location.host == 'scottsmith.sexy') {
	document.getElementsByTagName('body')[0].className += ' sexy';
	changeSource();
}