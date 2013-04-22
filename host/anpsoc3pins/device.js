var    ref = require('/node_modules/ffi/node_modules/ref');
var    ffi  = require('ffi');
var    util = require('util');

var uintPtr = ref.refType('uint');

var lv = new ffi.Library("./libvita", {
	"vitaInit":         ["int",    []                                 ],
	"vitaClose":        ["int",    ["int"]                            ],
	"USBLIB_new":       ["int",    ["uint", "uint", "string", "string"]         ],
    "USBLIB_setdebug":  ["int",    ["int"]                            ],
	"ANpsoc3_new":      ["int",    ["int"]                            ],
	"ANpsoc3_setpins":  ["int",    ["int", "int", "int", "int"]       ], // use int rather than unint
	"ANpsoc3_getpins":  ["int",    ["int", "int"]                     ],
	"ANpsoc3_readpins": ["int",    ["int", "int", "int", uintPtr]     ]    
    }
    );

var NUMBERPINS = 32;
var bh = null;
var OUTep = 1;
var INep = 0x82;

function log(text) {
    var str = util.format.apply(util.format, arguments);
    console.log(str);
}

function setpins(pins) {
    var rc = -1;
    var pinsdata00 = ref.alloc('uint');

    log("device          -- setting pins to %d, handle %d", pins, bh);

    if((rc = lv.ANpsoc3_setpins(bh, OUTep, pins, NUMBERPINS)) < 0) {
        log("device          -- error setting pins; handle is %d", bh);
	bh = null;
        return rc;
    } else {
	log("device          -- success setting pins; handle is %d", bh);
    }

    if((rc = lv.ANpsoc3_readpins(bh, INep, NUMBERPINS, pinsdata00)) < 0) {
	log("device -- error reading pins, error code is %d", rc);
	bh = null;
	return rc;
    }
 
    var pins00 = pinsdata00.deref();
    log("device          -- pins read: %d", pins00);
 
    return pins00;
}

function getpins() {
    var rc = -1;

    var pinsdata00 = ref.alloc('uint');

    log("device          -- getting pins");

    if((rc = lv.ANpsoc3_getpins(bh, OUTep)) < 0) {
        log("device -- error getting pins: handle %d; error code", bh, rc);
        bh = null;
        return rc;
    } else {
	log("device          -- success with request to get pins: handle %d", bh);
    }

    if((rc = lv.ANpsoc3_readpins(bh, INep, NUMBERPINS, pinsdata00)) < 0) {
  	log("device -- error reading pins, error code is %d", rc);
	bh = null;
	return rc;
    }
 
    var pins00 = pinsdata00.deref();
    return pins00;
}

function init() {
    var error = true;
    var outPort;
 
    if (bh === null) {
        log("device          -- initializing USB library ");
        lv.vitaInit();
    }

    if (bh === null) {
        outPort = lv.USBLIB_new(0x165F, 0, "0", "0");

        if (outPort <= 0) {
            log("device          -- unable to find USB device.  Is it plugged in?");
            // TODO error handling here; check USB connection to box
            return error;
        }

        bh = lv.ANpsoc3_new(outPort);
        if (bh <= 0) {
            log("device -- error opening  device.");
            // TODO error handling here; error opening logical device
            return true;
        } else {
            log("device          -- successfully initialized usb device");
            error = false;
	}
    } else {
	log("device          -- usb already initialized");
	error = false;
    }
    return error;
}

function setdebug(level)
{
    var levelreturned = lv.USBLIB_setdebug(level);
    return levelreturned;
}

exports.init = init;
exports.setpins = setpins;
exports.getpins = getpins;
exports.setdebug = setdebug;

