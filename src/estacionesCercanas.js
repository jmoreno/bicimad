var UI = require('ui');
var Vector2  = require('vector2');
var estaciones = require('ajax');
var Settings = require('settings');
var detalleEstacion = require('detalleEstacion');
var colores = require('colores');
var favorito = require('favoritas');

var splashWindow = new UI.Window();
splashWindow.fullscreen(true);

var text = new UI.Text({
  	position: new Vector2(0, 0),         
  	size: new Vector2(144, 168),
  	text: '\nBuscando estaciones cercanas',
  	font: 'GOTHIC_28_BOLD',
  	color: 'white',
  	textOverflow: 'wrap',
  	textAlign: 'center',
  	backgroundColor: colores.backgroundColor()
});

var parseaEstaciones = function (stations) {
  var items = [];
  for (var i = 0; i < stations.length; i++) {
    var title = stations[i].number;
    var subtitle = stations[i].name;
    items.push({
      title: title,
      subtitle: subtitle
    });
  }                     
  return items;
};


// Datos para la localización
exports.init = function () {
  
  text.text('\nBuscando estaciones cercanas');
  splashWindow.add(text);
  splashWindow.show();

  var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
  };

  function locationSuccess(pos) {

		var distancia = Settings.data('distancia');

		if (!distancia) {
		  distancia = 150;
		  Settings.data('distancia', distancia);
		}
		
		distancia_km = Math.round(distancia / 1000);

    var stationsURL = 'http://zinkinapis.zinkinapps.com/bici_mad/nearestStations?latitude=' + pos.coords.latitude + '&longitude=' + pos.coords.longitude + '&radius=' + distancia_km;
    stationsURL = 'http://zinkinapis.zinkinapps.com/bici_mad/nearestStations?latitude=40.428528&longitude=-3.7020599&radius=1';
    estaciones(
      {
        url: stationsURL,
        type: 'json'
      },
      function(data) {
        if (data.constructor == Array) {

          var stations = data;
          var estacionesMenuItems = parseaEstaciones(stations);
    
          var estacionesMenu = new UI.Menu({
          	fullscreen: true,
						backgroundColor: 'white',
						textColor: 'black',
						highlightBackgroundColor: colores.backgroundColor(),
						highlightTextColor: 'white',
            sections: [{
              title: 'Estaciones cercanas',
              items: estacionesMenuItems
            }]
          }); 
    
          estacionesMenu.on('select', function(e) {
            detalleEstacion.init(stations[e.itemIndex]);
          });
      
          estacionesMenu.on('longSelect', function(e) {
          	favorito.nuevoFavorito(stations[e.itemIndex]);
          });
      
          estacionesMenu.show();
          splashWindow.hide();

        } else {
          text.text('No hay ninguna estación en un radio de ' + distancia + ' metros');
        }
      },
      function(error) {
        console.log('Ha ocurrido un error al recuperar el listado de estaciones: ' + error);
        text.text('\nServicio no disponible \nPrueba más tarde');
      }
    );
  }

  function locationError(err) {
    console.log('location error (' + err.code + '): ' + err.message);
    text.text('\nError de conexión \nAbre la app de Pebble en tu teléfono');
  }

  // Make an asynchronous request
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);  

};
