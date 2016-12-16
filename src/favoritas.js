var UI = require('ui');
var infoParada = require('ajax');
var Settings = require('settings');

exports.getInfoEstacion = function (estacion) {
  var infoParadaURL = 'http://zinkinapis.zinkinapps.com/bici_mad/singleStation/' + estacion.number;
  infoParada(
    {
      url: infoParadaURL,
      type: 'json'
    },
    function(data) {
      if (data.constructor == Array) {
        return data[0];
      else {
      	console.log('Ha ocurrido un error al recuperar la información de la estacion: ' + error);
      }
    },
    function(error){
      console.log('Ha ocurrido un error al recuperar la información de la estacion: ' + error);
    }
  );
};


exports.nuevoFavorito = function (estacion) {
	
	var favoritos = Settings.data('favoritos');
	if (!favoritos) {
		favoritos = [];
	}
	
  var favoritoCard = new UI.Card({
		fullscreen: true,
		title: 'Guardar estación',
		subtitle: estacion.number,
		action: {
			up: 'images/action_icon_discard.png',
			down: 'images/action_icon_check.png'
		}
	});
	
	favoritoCard.on('click', 'up', function(){
		favoritoCard.hide();
	});

	favoritoCard.on('click', 'down', function(){
		favoritos.push(estacion);
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
