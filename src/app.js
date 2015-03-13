/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var paradas = require('ajax');
var llegadas = require('ajax');
var Vector2  = require('vector2');
var Settings = require('settings');

var splashWindow = new UI.Window();

var text = new UI.Text({
  position: new Vector2(0, 0),         
  size: new Vector2(144, 168),
  text: 'Buscando paradas cercanas',
  font: 'GOTHIC_28_BOLD',
  color: 'white',
  textOverflow: 'wrap',
  textAlign: 'center',
  backgroundColor: 'black'
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


// Genera los elementos del menú de paradas cercanas
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


var proximasLlegadas = function (Parada) {
  
  text.text('Obteniendo próximas llegadas');
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
          sections: [{
            title: 'Datos de la parada',
            items: [{title: Parada.stopId, subtitle: Parada.postalAddress}]
          },
          {
            title: 'Próximas llegadas',
            items: llegadasMenuItems
          }]
        }); 
    
        llegadasMenu.show();
        splashWindow.hide();
      } else {
        text.text('Parada sin servicio');
      }
    },
    function(error){
      console.log('Ha ocurrido un error al recuperar las llegadas: ' + error);
      text.text('Servicio no disponible \nPrueba más tarde');
    }
  );
};

// Datos para la localización
var paradasCercanas = function () {
  
  text.text('Buscando paradas cercanas');
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
            favoritos.push(parada);
            Settings.data('favoritos', favoritos);
          });
      
          paradasMenu.show();
          splashWindow.hide();

        } else {
          text.text('No hay ninguna parada en un radio de 150 metros');
        }
      },
      function(error) {
        console.log('Ha ocurrido un error al recuperar el listado de paradas: ' + error);
        text.text('Servicio no disponible \nPrueba más tarde');
      }
    );
  }

  function locationError(err) {
    console.log('location error (' + err.code + '): ' + err.message);
    text.text('Error de conexión \nAbre la app de Pebble en tu teléfono');
  }

  // Make an asynchronous request
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);  

};


var paradasFavoritas = function() {
  
  var favoritos = Settings.data('favoritos');
  
  if (!favoritos || favoritos.length == 0) {

    text.text('No hay favoritos guardados');
    splashWindow.add(text);
    splashWindow.show();

  } else {

    var paradasMenuItems = parseaParadas(favoritos);
    
    var paradasMenu = new UI.Menu({
      sections: [{
        title: 'Paradas cercanas',
        items: paradasMenuItems
      }]
    }); 
    
    paradasMenu.on('select', function(e) {
      var parada = favoritos[e.itemIndex];
      proximasLlegadas(parada);
    });
  
    paradasMenu.show();
       
  }
  
};


var verAjustes = function() {

  var subtitle = distancia + ' metros';
  var ajustesCard = new UI.Card({
    title: 'Distancia máxima:',
    subtitle: subtitle,
    body: '[0-500 metros]',
    action: {
      up: 'images/action_icon_plus.png',
      select: 'images/action_icon_check.png',
      down: 'images/action_icon_minus.png'
    }
  });
  ajustesCard.on('click', 'up', function(){
    if (distancia < 500) {
      distancia += 10;
      ajustesCard.subtitle(distancia + ' metros');
    }
  });
  ajustesCard.on('click', 'down', function(){
    if (distancia > 0) {
      distancia -= 10;
      ajustesCard.subtitle(distancia + ' metros');
    }
  });
  ajustesCard.on('click', 'select', function(){
    Settings.data('distancia', distancia);
    ajustesCard.hide();
  });
  ajustesCard.show();
};


// ESTA ES LA ZONA DONDE SE DEFINE E INSTANCIA EL MENÚ PRINCIPAL

var principalMenu = new UI.Menu({
  sections: [{
    title: 'Madrid Bus',
    items: [{
      title: 'Paradas cercanas'
    }, {
      title: 'Favoritos'
    }, {
      title: 'Ajustes'
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
      verAjustes();
      break;

    default:
      paradasCercanas();
  }
});
      
principalMenu.show();
