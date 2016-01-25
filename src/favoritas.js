var UI = require('ui');
var infoParada = require('ajax');
var Settings = require('settings');

var getInfoParada = function (element) {
  var infoParadaURL = 'http://zinkinapis.zinkinapps.com/emtmadrid/stopInfo/' + element.stopId;
  var elementChequeado = element;
  infoParada(
    {
      url: infoParadaURL,
      type: 'json'
    },
    function(data) {
      if ('stops' in data) {
      	elementChequeado = data.stops;
      	console.log('elementChequeado: ' + JSON.stringify(elementChequeado));
      }
    },
    function(error){
      console.log('Ha ocurrido un error al recuperar la información de la parada: ' + error);
    }
  );
  return elementChequeado;
};

var chequeaParada = function (element) {
  var elementChequeado = element;
  if (element.postalAddress.length === 0) {
    elementChequeado = getInfoParada(element);
  }
  return elementChequeado;
};

// Datos para la localización
exports.nuevoFavorito = function (element) {
	
	var favoritos = Settings.data('favoritos');
	if (!favoritos) {
		favoritos = [];
	}
	
	var parada = chequeaParada(element);

	var favoritoCard = new UI.Card({
		fullscreen: true,
		title: 'Guardar parada',
		subtitle: element.stopId,
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

// Datos para la localización
exports.borrarFavoritos = function () {
	
	var favoritoCard = new UI.Card({
		fullscreen: true,
		title: '¿Borrar lista de favoritos?',
		action: {
			up: 'images/action_icon_discard.png',
			down: 'images/action_icon_check.png'
		}
	});
	
	favoritoCard.on('click', 'up', function(){
		favoritoCard.hide();
	});

	favoritoCard.on('click', 'down', function(){
		Settings.data('favoritos', []);
		favoritoCard.hide();
	});
	
	favoritoCard.show();

};
