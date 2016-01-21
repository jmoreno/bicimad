var UI = require('ui');
var Vector2  = require('vector2');
var paradas = require('ajax');
var Settings = require('settings');

var proximasLlegadas = require('proximasLlegadas');

var splashWindow = new UI.Window();
splashWindow.fullscreen(true);

var text = new UI.Text({
  	position: new Vector2(0, 0),         
  	size: new Vector2(144, 168),
  	text: '\nBuscando paradas cercanas',
  	font: 'GOTHIC_28_BOLD',
  	color: 'white',
  	textOverflow: 'wrap',
  	textAlign: 'center',
  	backgroundColor: 'blueMoon'
});

var parseaParadas = function (stops) {
  var items = [];
  for (var i = 0; i < stops.length; i++) {
    var title = stops[i].stopId;
//    var subtitle = data.stop[i].postalAddress.replace(/\W+/g, " ");
    var subtitle = stops[i].postalAddress;
    console.log('Prueba: ' + title + ' ' + subtitle);
    items.push({
      title: title,
      subtitle: subtitle
    });
  }                     
  return items;
};


// Datos para la localización
exports.init = function () {
  
  text.text('\nBuscando paradas cercanas');
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

    var stopsURL = 'http://zinkinapis.zinkinapps.com/emtmadrid/stops?latitude=' + pos.coords.latitude + '&longitude=' + pos.coords.longitude + '&radius=' + distancia;
//    stopsURL = 'http://zinkinapis.zinkinapps.com/emtmadrid/stops?latitude=40.413897&longitude=-3.692898&radius=250';
    paradas(
      {
        url: stopsURL,
        type: 'json'
      },
      function(data) {
        if ('stop' in data) {

          var stops = data.stop;
          if (stops.constructor !== Array) {
            stops = new Array(stops);
          }

          var paradasMenuItems = parseaParadas(stops);
    
          var paradasMenu = new UI.Menu({
          	fullscreen: true,
						backgroundColor: 'white',
						textColor: 'black',
						highlightBackgroundColor: 'blueMoon',
						highlightTextColor: 'white',
            sections: [{
              title: 'Paradas cercanas',
              items: paradasMenuItems
            }]
          }); 
    
          paradasMenu.on('select', function(e) {
            var parada = stops[e.itemIndex];
            proximasLlegadas.init(parada);
          });
      
          paradasMenu.on('longSelect', function(e) {
            var favoritos = Settings.data('favoritos');
            if (!favoritos) {
              favoritos = [];
            }
            
            var parada = stops[e.itemIndex];

            var favoritoCard = new UI.Card({
            	fullscreen: true,
            	backgroundColor: 'blueMoon',
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

          });
      
          paradasMenu.show();
          splashWindow.hide();

        } else {
          text.text('No hay ninguna parada en un radio de ' + distancia + ' metros');
        }
      },
      function(error) {
        console.log('Ha ocurrido un error al recuperar el listado de paradas: ' + error);
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
