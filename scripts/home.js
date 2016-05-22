boomsvgloader.load('/images/Social%20Icons/home-sprite.svg');

function changeSource() {
    var image = document.querySelectorAll('.headerpic')[0];
    var source = image.src = image.src.replace('ScottPic_600.jpg', 'SexyScott.jpg');
}

if (window.location.host == 'scottsmith.sexy') {
	document.getElementsByTagName('body')[0].className += ' sexy';
	changeSource();
}