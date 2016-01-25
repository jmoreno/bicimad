var UI = require('ui');
var Vector2  = require('vector2');
var Settings = require('settings');
var colores = require('colores');
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
  	backgroundColor: colores.backgroundColor()
});

var parseaParadas = function (stops) {
  var items = [];
  for (var i = 0; i < stops.length; i++) {
    var title = stops[i].stopId;
//    console.log('Favorito: ' + JSON.stringify(stops[i]));
    var subtitle = stops[i].postalAddress;
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

    var paradasMenuItems = parseaParadas(favoritos);
    
    var paradasMenu = new UI.Menu({
    	fullscreen: true,
    	backgroundColor: 'white',
        textColor: 'black',
        highlightBackgroundColor: colores.backgroundColor(),
        highlightTextColor: 'white',
      	sections: [{
      		title: 'Favoritas',
      		items: paradasMenuItems
      }]
    }); 
    
    paradasMenu.on('select', function(e) {
      var parada = favoritos[e.itemIndex];
      proximasLlegadas.init(parada);
    });
    
    paradasMenu.on('longSelect', function(e) {
      var parada = favoritos[e.itemIndex];

      var favoritoCard = new UI.Card({
      	fullscreen: true,
        title: 'Borrar parada',
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
        favoritos.splice(e.itemIndex, 1);
        paradasMenuItems.splice(e.itemIndex, 1);
        Settings.data('favoritos', favoritos);
        paradasMenu.items(0, paradasMenuItems);
        favoritoCard.hide();
        
        if (favoritos.length === 0) {
          paradasMenu.hide();
        }
        
      });
            
      favoritoCard.show();

    });
  
    paradasMenu.show();
       
  }
  
};