/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
// var Voice = require('ui/voice');
var check = require('ajax');
var Settings = require('settings');

var paradasCercanas = require('paradasCercanas');
var paradasFavoritas = require('paradasFavoritas');
var buscarParada = require('buscarParada');
var ajustes = require('ajustes');
var colores = require('colores');

var backgroundColor = Settings.data('backgroundColor');

if (!backgroundColor) {
	backgroundColor = 'blueMoon';
	Settings.data('backgroundColor', backgroundColor);
};

var wakeUpHAL = function () {
  
  var checkURL = 'http://zinkinapis.zinkinapps.com/HelloHALDoyoureadmeHAL';
  check(
    {
      url: checkURL,
      type: 'json'
    },
    function(data) {
      console.log('todo bien, gracias');
    },
    function(error){
      console.log('Ha ocurrido un error al despertar a HAL: ' + error);
    }
  );
};

// ESTA ES LA ZONA DONDE SE DEFINE E INSTANCIA EL MENÚ PRINCIPAL

var principalMenu = new UI.Menu({
	fullscreen: true,
  backgroundColor: 'white',
  textColor: 'black',
  highlightBackgroundColor: backgroundColor,
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
      paradasCercanas.init();
      break;

    case 1:
      paradasFavoritas.init();
      break;

    case 2:
      buscarParada.init();
      break;

    case 3:
      ajustes.init();
      break;

    default:
      paradasCercanas();
  }
});
      

principalMenu.on('longSelect', function(e) {
  switch (e.itemIndex) {
    case 3:
      colores.init();
      break;

    default:
      break;
  }
});
wakeUpHAL();      
principalMenu.show();
