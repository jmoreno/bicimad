var UI = require('ui');
var Settings = require('settings');

exports.init = function() {

	var distancia = Settings.data('distancia');

	if (!distancia) {
	  distancia = 150;
	  Settings.data('distancia', distancia);
	}

  var nuevaDistancia = distancia;
  var subtitle = nuevaDistancia + ' metros';
  var ajustesCard = new UI.Card({
  	fullscreen: true,
  	backgroundColor: 'white',
    title: 'Radio de busqueda:',
    subtitle: subtitle,
    action: {
      up: 'images/action_icon_plus.png',
      select: 'images/action_icon_check.png',
      down: 'images/action_icon_minus.png'
    }
  });
  ajustesCard.on('click', 'up', function(){
    if (nuevaDistancia < 500) {
      nuevaDistancia += 10;
      ajustesCard.subtitle(nuevaDistancia + ' metros');
    }
  });
  ajustesCard.on('click', 'down', function(){
    if (nuevaDistancia > 100) {
      nuevaDistancia -= 10;
      ajustesCard.subtitle(nuevaDistancia + ' metros');
    }
  });
  ajustesCard.on('click', 'select', function(){
    distancia = nuevaDistancia;
    Settings.data('distancia', distancia);
    ajustesCard.hide();
  });
  ajustesCard.show();
};

