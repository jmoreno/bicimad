/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var check = require('ajax');
var paradas = require('ajax');
var llegadas = require('ajax');
var Vector2  = require('vector2');
var Settings = require('settings');
var Voice = require('ui/voice');

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

// llamada inicial para arrancar el servidor

function wakeUpHAL() {
  
  var checkURL = 'http://zinkinapis.zinkinapps.com/HelloHALDoyoureadmeHAL';
  check(
    {
      url: checkURL,
      type: 'json'
    },
    function(data) {
      console.log(data);
    },
    function(error){
      console.log('Ha ocurrido un error al despertar a HAL: ' + error);
    }
  );
};
-

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

            var favoritoCard = new UI.Card({
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
  
  if (!favoritos || favoritos.length === 0) {

    text.text('No hay favoritos guardados');
    splashWindow.add(text);
    splashWindow.show();

  } else {

    var paradasMenuItems = parseaParadas(favoritos);
    
    var paradasMenu = new UI.Menu({
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

// Pantalla de busqueda de paradas introduciendo el número de la misma

var searchWindow = function () {
  
  var inputWindow = new UI.Window();

  var numbers = [];
  var stopId = [0, 0, 0, 0];
  var begin = 7;
  var numberSelected = 0;
  
  var title = new UI.Text({
    position: new Vector2(0, 10),         
    size: new Vector2(123, 168),
    text: 'Parada',
    font: 'GOTHIC_28_BOLD',
    color: 'white',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'black'
  });
  
  inputWindow.add(title);
  inputWindow.action('up', 'images/action_icon_plus.png');
  inputWindow.action('down', 'images/action_icon_minus.png');
  inputWindow.action('select', 'images/action_icon_check.png');

  for (var i = 0; i < 4; i++) {
      begin = 7 + (i * 28);
    var number = new UI.Text({
      position: new Vector2(begin, 60),
      size: new Vector2(25, 40),
      text: stopId[i],
      font: 'GOTHIC_28_BOLD',
      color: 'white',
      textAlign: 'center',
      borderColor: 'white',
      backgroundColor: 'black'
    });
    numbers.push(number);
  }

  numbers[numberSelected].color('black');
  numbers[numberSelected].backgroundColor('white');

  for (i = 0; i < 4; i++) {
    inputWindow.add(numbers[i]);
  }

  inputWindow.show();

  inputWindow.on('click', 'up', function () {
    if (stopId[numberSelected] === 9) {
      stopId[numberSelected] = 0;
    } else {
      stopId[numberSelected] += 1;
    }
    numbers[numberSelected].text(stopId[numberSelected]);
  });

  inputWindow.on('click', 'down', function () {
    if (stopId[numberSelected] === 0) {
      stopId[numberSelected] = 9;
    } else {
      stopId[numberSelected] -= 1;
    }
    numbers[numberSelected].text(stopId[numberSelected]);
  });

  inputWindow.on('click', 'select', function() {
    if (numberSelected === 3) {
      var parada = stopId[0] * 1000 + stopId[1] * 100 + stopId[2] * 10 + stopId[3];
      var checkCard = new UI.Card({
        title: 'Próximas llegadas a parada:',
        subtitle: parada,
        action: {
          up: 'images/action_icon_discard.png',
          down: 'images/action_icon_check.png'
        }
      });
            
      checkCard.on('click', 'up', function(){
        numbers[numberSelected].color('white');
        numbers[numberSelected].backgroundColor('black');
        numberSelected = 0;
        numbers[numberSelected].color('black');
        numbers[numberSelected].backgroundColor('white');    
        checkCard.hide();
      });
            
      checkCard.on('click', 'down', function(){
        var paradaBuscar = {
          stopId: parada,
          postalAddress: ''
        };
        proximasLlegadas(paradaBuscar);
        checkCard.hide();
        inputWindow.hide();
      });
            
      checkCard.show();
  
    } else {
      numbers[numberSelected].color('white');
      numbers[numberSelected].backgroundColor('black');
      numberSelected += 1;
      numbers[numberSelected].color('black');
      numbers[numberSelected].backgroundColor('white');    
    }
  });
  
  inputWindow.on('longClick', 'select', function () {
    numbers[numberSelected].color('white');
    numbers[numberSelected].backgroundColor('black');
    numberSelected = 0;
    numbers[numberSelected].color('black');
    numbers[numberSelected].backgroundColor('white');    
  });
  
};

// ESTA ES LA ZONA DONDE SE DEFINE E INSTANCIA EL MENÚ PRINCIPAL

var principalMenu = new UI.Menu({
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
      searchWindow();
      break;

    case 3:
      verAjustes();
      break;

    default:
      paradasCercanas();
  }
});
      
wakeUpHAL();      
principalMenu.show();
