var UI = require('ui');
var infoParada = require('ajax');
var Settings = require('settings');

var guardaFavorito = function (parada) {

	var favoritos = Settings.data('favoritos');
	if (!favoritos) {
		favoritos = [];
	}
	
  var favoritoCard = new UI.Card({
		fullscreen: true,
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

var getInfoParada = function (parada) {
  var infoParadaURL = 'http://zinkinapis.zinkinapps.com/emtmadrid/stopInfo/' + parada.stopId;
  infoParada(
    {
      url: infoParadaURL,
      type: 'json'
    },
    function(data) {
      if ('stops' in data) {
        guardaFavorito(data.stops);
      }
    },
    function(error){
      console.log('Ha ocurrido un error al recuperar la información de la parada: ' + error);
    }
  );
};


exports.nuevoFavorito = function (element) {
	
  if (element.postalAddress.length === 0) {
    getInfoParada(element);
  } else {
    guardaFavorito(element);
  }

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
