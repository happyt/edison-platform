/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
var mraa = require("mraa");

// Start by loading in mainn web page
var fs = require('fs');

var mainPage = fs.readFileSync('/node_app_slot/default.html');

var sensor_value = 0;
var last_sensor_value = 0;

// Start web service
//Create Socket.io server
var http = require('http');
var app = http.createServer(function (req, res) {
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(mainPage);
}).listen(1337);
var io = require('socket.io')(app);

console.log("Simple socket.io messaging....");
console.log("Web listening on port 1337");

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');

    //Start watching Sensors connected to the board
//    startSensorWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('message', function (msg) {
        console.log('message--> ' + msg);
        var args = msg.split(" ");
        var delta = parseInt(args[1]);
        console.log("Value: " + delta);
        if (delta != 0) {
            switch(args[0]) {
                case "a":
                    rotate(motorA, delta);
                    break;
                case "b":
                    rotate(motorB, delta);
                    break;
                default:
                    // default code block
            }
        }
        socket.emit('message', msg);
    });

    
    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});


//Touch Sensor connected to Dn connector
var digital_pin = new mraa.Gpio(7);
digital_pin.dir(mraa.DIR_IN);

// Leave the above lines for propper jshinting
var Uln200xa_lib = require('jsupm_uln200xa');
// Instantiate a Stepper motor on a ULN200XA Darlington Motor Driver
// This was tested with the Grove Geared Step Motor with Driver

// Instantiate a ULN2003XA stepper objects
var motorA = new Uln200xa_lib.ULN200XA(4096, 8, 9, 10, 11);
var motorB = new Uln200xa_lib.ULN200XA(4096, 4, 3, 5, 6);

motorA.angle = 0;
motorB.angle = 0;

var setSpeed = function(motor, speed){
    motor.setSpeed(speed); // 5 RPMs    
}

var rotate = function(motor, delta) {
    if (delta > 0) {    
        motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CW);   
    } else {
        motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CCW);   
    }
    motor.stepperSteps(Math.abs(delta));    
    motor.angle += delta;
}


// Run ULN200xa driven stepper tests
setSpeed(motorA, 5);
setSpeed(motorB, 5);
rotate(motorA, 1024);
console.log("did A?");
rotate(motorB, 1024);
rotate(motorB, -1024);
console.log("did B?");

var joystick = require('jsupm_joystick12');
// Instantiate a joystick on analog pins A0 and A1
var myJoystick = new joystick.Joystick12(0, 1);
var baseX = -1 * roundNum(myJoystick.getXInput(), 2);
var baseY = -1 * roundNum(myJoystick.getYInput(), 2);
var moveSize = 64;

    setInterval(function()
    {
        rotate(motorA, 256);
    }, 3000);


// Print the X and Y input values every second
var test = function() {
    setInterval(function()
    {
        var XString = "Driving X:" + roundNum(myJoystick.getXInput(), 2);
        var YString = ": and Y:" + roundNum(myJoystick.getYInput(), 2);
        console.log(XString + YString);
    }, 1000);
}

function roundNum(num, decimalPlaces)
{
	var extraNum = (1 / (Math.pow(10, decimalPlaces) * 1000));
	var numerator = Math.round((num + extraNum) * (Math.pow(10, decimalPlaces)));
	var denominator = Math.pow(10, decimalPlaces);
	return (numerator / denominator);
}

var rotate = function(motor, delta) {
    if (delta > 0) {    
        motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CW);   
    } else {
        motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CCW);   
    }
    motor.stepperSteps(Math.abs(delta));    
    motor.angle += delta;
}

var rotatePlus = function(motor) {
    console.log("starting...");
    motor.setSpeed(5); // 5 RPMs
    motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CW);
    motor.stepperSteps(4096);
    console.log("done...");
}

var motorStop = function(motor) {
    motor.release();
}

var appQuit = function()
{
	motorA = null;
	motorB = null;
	Uln200xa_lib.cleanUp();
	Uln200xa_lib = null;
	console.log("Exiting");
	process.exit(0);
};

var turnMotor = function(AorB, distance) {
    if (AorB === 0) {
        rotate(motorA, distance);
    } else {
        rotate(motorB, distance);        
    }
}


var centre = function() {
    console.log("Looking for joystick...");
    setInterval(function()
    {
        console.log("...");
        testButton();
        var X = -1 * roundNum(myJoystick.getXInput(), 2);
        var Y = -1 * roundNum(myJoystick.getYInput(), 2);

        if((baseX - X) > 0.1) {
        //    console.log("plus");
            turnMotor(0, moveSize);
        }
        if((baseX - X) < -0.1) {
        //    console.log("minus");
            turnMotor(0, -moveSize);
        }
        if((baseY - Y) > 0.1) {
        //    console.log("plus");
            turnMotor(1, moveSize);
        }
        if((baseY - Y) < -0.1) {
        //    console.log("minus");
            turnMotor(1, -moveSize);
        }
    //    console.log("X: " + X.toString());
    }, 100);
}


/*

// quit the app after this time
setTimeout(function()
{
    console.log("Testing here....");
	
    rotate(motorA, 1024);
    rotate(motorA, 123);
    rotate(motorA, 456);
    
    
    console.log("Centre here...." + motorA.angle);
	
    rotate(motorA, motorA.angle * -1);
    
    console.log("Stopping here....");
	motorStop(motorA);
	motorStop(motorB);
    appQuit();
}, 10000);

*/

var testButton = function() {    
    sensor_value = digital_pin.read();
//    console.log("Pin value: " + sensor_value);
    if (sensor_value === 1 && last_sensor_value === 0) {
//        console.log("ON...");
//            socket.emit('message', "present");
    } else if (sensor_value === 0 && last_sensor_value === 1) {
//        console.log("OFF!!!");
        //socket.emit('message', "absent");
        motorA.angle = 0;
        motorB.angle = 0;
        clearInterval(centre);
        console.log("Zero set...");
    }
    last_sensor_value = sensor_value;
};


