var check = require('ajax');

exports.wakeUpHAL = function () {
  
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

