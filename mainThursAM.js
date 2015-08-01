/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
var mraa = require("mraa");

var sensor_value = 0;
var last_sensor_value = 0;


//Touch Sensor connected to Dn connector
var digital_pin = new mraa.Gpio(7);
digital_pin.dir(mraa.DIR_IN);

// Leave the above lines for propper jshinting
var Uln200xa_lib = require('jsupm_uln200xa');
// Instantiate a Stepper motor on a ULN200XA Darlington Motor Driver
// This was tested with the Grove Geared Step Motor with Driver

var joystick = require('jsupm_joystick12');
// Instantiate a joystick on analog pins A0 and A1
var myJoystick = new joystick.Joystick12(0, 1);

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

// Instantiate a ULN2003XA stepper object
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

// Run ULN200xa driven stepper
setSpeed(motorA, 5);
setSpeed(motorB, 5);
rotate(motorA, 1024);
console.log("did A?");
rotate(motorB, 1024);
rotate(motorB, -1024);
console.log("did B?");

var baseX = -1 * roundNum(myJoystick.getXInput(), 2);
var baseY = -1 * roundNum(myJoystick.getYInput(), 2);
var moveSize = 64;

var turnMotor = function(AorB, distance) {
    if (AorB === 0) {
        rotate(motorA, distance);
    } else {
        rotate(motorB, distance);        
    }
}

console.log("Looking for joystick...set zero position...");

var centre = setInterval(function()
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


