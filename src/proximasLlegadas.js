// Genera los elementos del menú de paradas cercanas

var UI = require('ui');
var Vector2  = require('vector2');
var llegadas = require('ajax');
var colores = require('colores');
var favorito = require('favoritas');

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
  	backgroundColor: colores.backgroundColor()
});

var parseaLlegadas = function (data) {
  var items = [];
  var arrives = data.arrives;
  if (arrives.constructor !== Array) {
    console.log('Llegadas no es un array');
    arrives = new Array(arrives);
  }
  for (var i = 0; i < arrives.length; i++) {
    var title = arrives[i].lineId + ' - ' + arrives[i].destination;
    var time;
    var distance;
    if (arrives[i].busTimeLeft == 999999 ) {
      time = 'Más de 20 min.';
    } else {
      time = Math.round(arrives[i].busTimeLeft / 60) + ' min.';
    }
    if (arrives[i].busDistance == -1) {
      distance = '';
    } else {
      distance = ' - ' + arrives[i].busDistance + 'm';
    }
    var subtitle = time + distance;

    items.push({
      title: title,
      subtitle: subtitle
    });
  }                     
  return items;
};

exports.init = function (Parada) {
  
  text.text('\nObteniendo próximas llegadas');
  splashWindow.add(text);
  splashWindow.show();
  
  var arrivesURL = 'http://zinkinapis.zinkinapps.com/emtmadrid/arrives/' + Parada.stopId;
  llegadas(
    {
      url: arrivesURL,
      type: 'json'
    },
    function(data) {
      if ('arrives' in data) {
        var llegadasMenuItems = parseaLlegadas(data);
        var llegadasMenu = new UI.Menu({
        	fullscreen: true,
        	backgroundColor: 'white',
        	textColor: 'black',
        	highlightBackgroundColor: colores.backgroundColor(),
        	highlightTextColor: 'white',
          sections: [{
            title: 'Datos de la parada',
            items: [{title: Parada.stopId, subtitle: Parada.postalAddress}]
          },
          {
            title: 'Próximas llegadas',
            items: llegadasMenuItems
          }]
        }); 
        
        llegadasMenu.on('select', function(e) {
        	if (e.sectionIndex == 0 && e.itemIndex == 0) {
        		favorito.nuevoFavorito({title: Parada.stopId, subtitle: Parada.postalAddress});
        	}
        });
        
        llegadasMenu.show();
        splashWindow.hide();
      } else {
        text.text('Parada sin servicio');
      }
    },
    function(error){
      console.log('Ha ocurrido un error al recuperar las llegadas: ' + error);
      text.text('\nServicio no disponible \nPrueba más tarde');
    }
  );
};

