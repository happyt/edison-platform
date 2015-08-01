/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
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

var setSpeed = function(motor, speed){
    motor.setSpeed(speed); // 5 RPMs    
}

var setDirection = function(motor, direction) {
    if (direction) {    
        motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CW);   
    } else {
        motor.setDirection(Uln200xa_lib.ULN200XA.DIR_CCW);   
    }
    
}

var rotate = function(motor, delta) {
    motor.stepperSteps(delta);    
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
setDirection(motorA, true);
setSpeed(motorB, 5);
setDirection(motorB, true);
rotate(motorA, 1024);
console.log("did A?");
rotate(motorB, 1024);
setDirection(motorB, false);
rotate(motorB, 1024);
console.log("did B?");

var baseX = -1 * roundNum(myJoystick.getXInput(), 2);
var baseY = -1 * roundNum(myJoystick.getYInput(), 2);
var moveSize = 64;

setInterval(function()
{
    var X = -1 * roundNum(myJoystick.getXInput(), 2);
    var Y = -1 * roundNum(myJoystick.getYInput(), 2);
    
    if((baseX - X) > 0.1) {
        console.log("plus");
        setDirection(motorA, true);
        rotate(motorA, moveSize);   
    }
    if((baseX - X) < -0.1) {
        console.log("minus");
        setDirection(motorA, false);
        rotate(motorA, moveSize);   
    }
    if((baseY - Y) > 0.1) {
        console.log("plus");
        setDirection(motorB, true);
        rotate(motorB, moveSize);   
    }
    if((baseY - Y) < -0.1) {
        console.log("minus");
        setDirection(motorB, false);
        rotate(motorB, moveSize);   
    }
//    console.log("X: " + X.toString());

}, 500);

//rotatePlus(motorA);

//motorA.goForward();
//motorB.goForward();
//setTimeout(motorA.reverseDirection, 2000);
//setTimeout(motorB.reverseDirection, 2000);
setTimeout(function()
{
    console.log("Stop here....");
	motorStop(motorA);
	motorStop(motorB);
    appQuit();
}, 30000);