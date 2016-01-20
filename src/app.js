/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2  = require('vector2');
var Settings = require('settings');
var Voice = require('ui/voice');

var madridBus = require('madridBus')
var buscarParada = require('buscarParada')
var paradas = require('ajax');

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

var distancia = Settings.data('distancia');

if (!distancia) {
  distancia = 150;
  Settings.data('distancia', distancia);
}

/* ESTA ES LA ZONA DONDE ESTÁN LAS FUNCIONES NECESARIAS PARA LA GEOLOCALIZACIÓN
   Y LA BUSQUEDA DE LOS TIEMPOS DE ESPERA DE LAS PARADAS */

// Genera los elementos del menú de paradas cercanas
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
var paradasCercanas = function () {
  
  text.text('\nBuscando paradas cercanas');
  splashWindow.add(text);
  splashWindow.show();

  var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
  };

  function locationSuccess(pos) {
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
            proximasLlegadas(parada);
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


var paradasFavoritas = function() {
  
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
        highlightBackgroundColor: 'blueMoon',
        highlightTextColor: 'white',
      	sections: [{
      		title: 'Favoritas',
      		items: paradasMenuItems
      }]
    }); 
    
    paradasMenu.on('select', function(e) {
      var parada = favoritos[e.itemIndex];
      proximasLlegadas(parada);
    });
    
    paradasMenu.on('longSelect', function(e) {
      var parada = favoritos[e.itemIndex];

      var favoritoCard = new UI.Card({
      	fullscreen: true,
      	backgroundColor: 'blueMoon',
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


var verAjustes = function() {

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

// ESTA ES LA ZONA DONDE SE DEFINE E INSTANCIA EL MENÚ PRINCIPAL

var principalMenu = new UI.Menu({
	fullscreen: true,
  backgroundColor: 'white',
  textColor: 'black',
  highlightBackgroundColor: 'blueMoon',
  highlightTextColor: 'white',
  sections: [{
    title: 'Paradas de la EMT',
    items: [{
      title: 'Cercanas',
      icon: 'images/menu_icon_location.png'
    }, {
      title: 'Favoritas',
      icon: 'images/menu_icon_starred.png'
    }, {
      title: 'Buscar',
      icon: 'images/menu_icon_search.png'
    }, {
      title: 'Ajustes',
      icon: 'images/menu_icon_settings.png'
    }]
  }]
});

principalMenu.on('select', function(e) {
  switch (e.itemIndex) {
    case 0:
      paradasCercanas();
      break;

    case 1:
      paradasFavoritas();
      break;

    case 2:
      buscarParada.init();
      break;

    case 3:
      verAjustes();
      break;

    default:
      paradasCercanas();
  }
});
      
madridBus.wakeUpHAL();      
principalMenu.show();
