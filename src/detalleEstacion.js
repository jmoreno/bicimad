// Genera los elementos del menú de paradas cercanas

var UI = require('ui');
var Vector2  = require('vector2');
var colores = require('colores');
var favorito = require('favoritas');

exports.init = function (Estacion) {
  
  var splashWindow = new UI.Window();
	splashWindow.fullscreen(true);

  var detalleMenu = new UI.Menu({
  	fullscreen: true,
    backgroundColor: 'white',
    textColor: 'black',
    highlightBackgroundColor: colores.backgroundColor(),
    highlightTextColor: 'white',
    sections: [{
    	title: 'Datos de la estación',
      items: [{title: Estacion.number}]
    },{
    	title: 'Detalle',
      items: [{title: 'Nombre:', subtitle: Estacion.name}, 
            	{title: 'Dirección:', subtitle: Estacion.address},
            	{title: 'Número de bases', subtitle: Estacion.total_bases},
            	{title: 'Bicicletas disponibles', subtitle: Estacion.dock_bikes},
            	{title: 'Bases libres', subtitle: Estacion.free_bases},
            	{title: 'Bases reservadas', subtitle: Estacion.reservations_count}]
    }]
  }); 
        
  detalleMenu.on('select', function(e) {
  	if (e.sectionIndex == 0 && e.itemIndex == 0) {
  		favorito.nuevoFavorito(Estacion);
  	}
  });
        
  detalleMenu.show();
  splashWindow.hide();

};

