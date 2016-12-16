var UI = require('ui');
var Vector2  = require('vector2');
var Settings = require('settings');
var colores = require('colores');
var favoritas = require('favoritas');
var detalleEstacion = require('detalleEstacion');

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
    var subtitle = stations[i].address;
    items.push({
      title: title,
      subtitle: subtitle
    });
  }                     
  return items;
};

exports.init = function() {
  
  var favoritos = Settings.data('favoritos');
  
  if (!favoritos || favoritos.length === 0) {

    text.text('\nNo hay favoritos guardados');
    splashWindow.add(text);
    splashWindow.show();

  } else {

    var estacionesMenuItems = parseaEstaciones(favoritos);
    
    var estacionesMenu = new UI.Menu({
    	fullscreen: true,
    	backgroundColor: 'white',
        textColor: 'black',
        highlightBackgroundColor: colores.backgroundColor(),
        highlightTextColor: 'white',
      	sections: [{
      		title: 'Favoritas',
      		items: estacionesMenuItems
      }]
    }); 
    
    estacionesMenu.on('select', function(e) {
      var estacion = favoritas.getInfoEstacion;
      detalleEstacion.init(estacion);
    });
    
    estacionesMenu.on('longSelect', function(e) {
      var estacion = favoritos[e.itemIndex];

      var favoritoCard = new UI.Card({
      	fullscreen: true,
        title: 'Borrar estación',
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
        favoritos.splice(e.itemIndex, 1);
        estacionesMenuItems.splice(e.itemIndex, 1);
        Settings.data('favoritos', favoritos);
        estacionesMenu.items(0, estacionesMenuItems);
        favoritoCard.hide();
        
        if (favoritos.length === 0) {
          estacionesMenu.hide();
        }
        
      });
            
      favoritoCard.show();

    });
  
    estacionesMenu.show();
       
  }
  
};