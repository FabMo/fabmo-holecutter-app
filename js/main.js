var xMax = 6.0;
var yMax = 8.0;
var xCenter = xMax / 2;
var yCenter = yMax / 2;

function getConfig(callback) {
  if(fabmo.isPresent()) {
    return fabmo.getConfig(callback);
  }
  callback(null, {
    machine : {
      envelope : {
        xmin : 0,
        xmax : 6,
        ymin : 0,
        ymax : 8
      }
    }
  });
};

$(document).ready(function() {
  $('.advanced').hide();
  getConfig(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var xMax = data.machine.envelope.xmax.toString();
      $('#diameter').attr('data-parsley-max', xMax);
    }
  });
});

var $selector = $('#signupForm'),
form = $selector.parsley();

$('#diameter').on('keyup', function() {
  if ($('#diameter').val().length > 0) {
    $('.diameter-id').text($('#diameter').val() + '"')
  } else {
    $('.diameter-id').text('')
  }
});

$('#depth').on('keyup', function() {
  if ($('#depth').val().length > 0) {
    $('.depth-id').text($('#depth').val() + '"')
  } else {
    $('.depth-id').text('')
  }
});

$('.center-bit').on('click', function() {
  getConfig(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      xMax = data.machine.envelope.xmax;
      yMax = data.machine.envelope.ymax;
      xCenter = xMax / 2;
      yCenter = yMax / 2;
      var gcode = "G0 X" + xCenter + " Y" + yCenter + " Z" + 1;
      fabmo.runGCode(gcode);
    }
  });
  $('.modal-content p').text('This will be the center of your hole. Make sure it is aligned properly!');
  $('.modal, .modal-container').fadeIn();
});

$('.exit-modal').on('click', function() {
  $('.modal, .modal-container').fadeOut('fast');
});

$('.basic-link').on('click', function() {
  $('.basic').show();
  $('.advanced').hide();
  $('.lock').hide();
  $('.unlock').hide();
  $('.advanced').attr("disabled", "true");
  $('.advanced + ul').hide();
  $('.basic + ul').show();
});
$('.advanced-link').on('click', function() {
  $('.basic').hide();
  $('.advanced').show();
  $('.lock').show();
  $('.unlock').hide();
  $('.advanced').attr("disabled", "true");
  $('.parsley-required').hide();
  $('.advanced + ul').show();
  $('.basic + ul').hide();
});

$('.lock').on('click', function() {
  $('.lock').hide();
  $('.unlock').show();
  $('.advanced').removeAttr('disabled');
});

$('.unlock').on('click', function() {
  $('.lock').show();
  $('.unlock').hide();
  $('.advanced').attr("disabled", "true");
});

function makeCircle(config) {
  config = config || {};
  var xMax = config.machine.envelope.xmax || 6.0;
  var yMax = config.machine.envelope.ymax || 8.0;
  var xCenter = xMax / 2;
  var yCenter = yMax / 2;
  var diameter = parseFloat($('#diameter').val());
  var speed = parseFloat($('#feed-rate').val());
  var cutThrough = parseFloat($('#cut-through').val());
  var depth = Math.abs(parseFloat($('#depth').val()));
  var bitDiameter = parseFloat($('#bit-diameter').val());
  var actualDiameter = (diameter - bitDiameter);
  if (actualDiameter==0) actualDiameter = 0.001;
  var depthTotal = depth + cutThrough;
  var maxPlunge = bitDiameter * .75;
  var passes = Math.ceil(depthTotal / maxPlunge);
  var plunge = (0 - (depthTotal / passes)).toFixed(5);
  var shopbotCode = ["'Simple Circle'",
    "'Center: " + xCenter + "," + yCenter + "  Diameter: " + diameter + "'",
    "'Bit Diameter: " + bitDiameter + "'",
    "'Safe Z'",
    "JZ, 1",
    "'Spindle On'",
    "SO, 1,1",
    "MS," + speed,
    "pause 3",
    "CP," + actualDiameter + "," + xCenter + "," + yCenter + ",T,,,," + plunge + "," + passes + ",,,,,1",
    "'Safe Z'",
    "JZ, 1",
    "'Spindle Off'",
    "SO, 1,0",
    "'Jog Home'",
    "J2, 0,0"
  ];
  var code = shopbotCode.join('\n');
  if (actualDiameter<=0){
    $("#err-msg").text("Can not cut a "+diameter+" inch hole with a "+bitDiameter+" inch bit.");
    return; 
  }
  $("#err-msg").text("");
  fabmo.submitJob({
    file: code,
    filename: 'example-circle.sbp',
    name: diameter + '" Diameter Circle',
    description: diameter + '" diameter circle centered at ' + xCenter + ',' + yCenter + ' at a depth of ' + depth + '"'
  });
}

  form.subscribe('parsley:form:success', function (e) {
    console.log("Got a form submit");
    getConfig(function(err, data) {
      if(err) {
        console.error(err);
        return;
      }
      makeCircle(data);
    });
});

$('#submit').on('click', function(evt) {
  form.validate();
  $('')

});
