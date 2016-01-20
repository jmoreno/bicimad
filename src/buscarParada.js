// Pantalla de busqueda de paradas introduciendo el número de la misma

exports.init = function () {
  
  var inputWindow = new UI.Window();
  inputWindow.fullscreen(true);

  var numbers = [];
  var stopId = [0, 0, 0, 0];
  var begin = 5;
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
      begin = 5 + (i * 28);
    var number = new UI.Text({
      fullscreen: true,
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
      	fullscreen: true,
      	backgroundColor: 'white',
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

