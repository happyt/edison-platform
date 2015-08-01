/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
var Uln200xa_lib = require('jsupm_uln200xa');
// Instantiate a Stepper motor on a ULN200XA Darlington Motor Driver
// This was tested with the Grove Geared Step Motor with Driver

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
}, 2000);