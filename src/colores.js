var UI = require('ui');
var Settings = require('settings');

var colores = ['Black', 'Yellow', 'Orange', 'Red', 'Folly', 'Magenta', 'Purple', 'Liberty', 'Blue', 'Blue Moon', 'Cobalt Blue', 'Cyan', 'Green', 'Malachite', 'Mint Green'];

var nombreColores = ['black', 'yellow', 'orange', 'red', 'folly', 'magenta', 'purple', 'liberty', 'blue', 'blueMoon', 'cobaltBlue', 'cyan', 'green', 'malachite', 'mintGreen'];

var cargaMenu = function () {
  var items = [];
  for (var i = 0; i < colores.length; i++) {
    var title = colores[i];
    items.push({
      title: title,
    });
  }                     
  return items;
};

export.backgroundColor = function () {
    var backgroundColor = Settings.data('backgroundColor');

	if (!backgroundColor) {
		backgroundColor = 'black';
		Settings.data('backgroundColor', backgroundColor);
	}
	return backgroundColor;
};

exports.init = function() {
	
	var backgroundColor = Settings.data('backgroundColor');
  
    var coloresMenu = new UI.Menu({
    	fullscreen: true,
    	backgroundColor: 'white',
        textColor: 'black',
        highlightBackgroundColor: backgroundColor,
        highlightTextColor: 'white',
      	sections: [{
      		title: 'Colores',
      		items: cargaMenu()
      }]
    }); 
    
    coloresMenu.on('select', function(e) {
      	Settings.data('backgroundColor', nombreColores[e.itemIndex]);
    	coloresMenu.hide();
    });
    
    coloresMenu.show();
       
};