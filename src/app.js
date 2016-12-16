var UI = require('ui');
var check = require('ajax');

var estacionesCercanas = require('estacionesCercanas');
var estacionesFavoritas = require('estacionesFavoritas');
var ajustes = require('ajustes');
var colores = require('colores');
var favoritos = require('favoritas');

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
  highlightBackgroundColor: colores.backgroundColor(),
  highlightTextColor: 'white',
  sections: [{
    title: 'Estaciones de BiciMAD',
    items: [{
      title: 'Cercanas',
      icon: 'images/menu_icon_location.png'
    }, {
      title: 'Favoritas',
      icon: 'images/menu_icon_starred.png'
    }, {
      title: 'Ajustes',
      icon: 'images/menu_icon_settings.png'
    }]
  }]
});

principalMenu.on('select', function(e) {
  switch (e.itemIndex) {
    case 0:
      estacionesCercanas.init();
      break;

    case 1:
      estacionesFavoritas.init();
      break;

    case 2:
      ajustes.init();
      break;

    default:
      estacionesCercanas();
  }
});      

principalMenu.on('longSelect', function(e) {
  if (e.itemIndex == 3) {
  	colores.init();
  } else if (e.itemIndex == 1) {
    favoritos.borrarFavoritos();
  }
});

wakeUpHAL();      
principalMenu.show();
