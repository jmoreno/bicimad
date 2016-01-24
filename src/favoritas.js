var UI = require('ui');
var infoParada = require('ajax');
var Settings = require('settings');

var backgroundColor = Settings.data('backgroundColor');

var splashWindow = new UI.Window();
splashWindow.fullscreen(true);

function infoParada(element) {
  var infoParadaURL = 'http://zinkinapis.zinkinapps.com/emtmadrid/stopInfo/' + element.title;
  infoParada(
    {
      url: infoParadaURL,
      type: 'json'
    },
    function(data) {
      if ('stops' in data) {
      	element.subtitle = data.stops[0].postalAddress;
      }
    },
    function(error){
      console.log('Ha ocurrido un error al recuperar la información de la parada: ' + error);
    }
  );
  return element;
}

function chequeaParada(element) {
    if (!element.subtitle ) {
    	element = infoParada(element);
    }
    return element;
}

// Datos para la localización
exports.nuevoFavorito = function (element) {
	
	var favoritos = Settings.data('favoritos');
	if (!favoritos) {
		favoritos = [];
	}
	
	var parada = chequeaParada(element);

	var favoritoCard = new UI.Card({
		fullscreen: true,
		backgroundColor: backgroundColor,
		title: 'Guardar parada',
		subtitle: parada.stopId,
		action: {
			up: 'images/action_icon_discard.png',
			down: 'images/action_icon_check.png'
		}
	});
	
	favoritoCard.on('click', 'up', function(){
		favoritoCard.hide();
	});

	favoritoCard.on('click', 'down', function(){
		favoritos.push(parada);
		Settings.data('favoritos', favoritos);
		favoritoCard.hide();
	});
	
	favoritoCard.show();

};
