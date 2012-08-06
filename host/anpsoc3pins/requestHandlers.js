var querystring = require("querystring"),
    fs          = require("fs"),
    url         = require("url"),
    device      = require("./device"),
    util        = require("util");

var NUMBERPINS = 32;

function log(text) {
    var str = util.format.apply(util.format, arguments);
    console.log(str);
}

function get(response) {
    console.log("requestHandlers -- request handler 'get' or '/' was called.");
    var error = device.init();
    if(!error) {
	var pinsfromdevice = device.getpins();
	if(pinsfromdevice >=0) {
	    respond(response, pinsfromdevice);
	    return;
	}
    }
    responderror(response);	
}

function set(response, postData)
{
    var pins = 0;
    var pinsfromdevice = 0;
    var pinlabel = "";

    console.log("requestHandlers -- 'set' was called.");
 
    for(i = 1; i < NUMBERPINS + 1; i++) {
	pinlabel = "pin" + i.toString();
	if(parseInt(querystring.parse(postData)[pinlabel]) == 1) {
	    pins = pins | (1 << (i - 1));
	}
    }

    var error = device.init();

    if(!error) {
	console.log("requestHandlers -- setting pins to: %d", pins);
	var pinsfromdevice = device.setpins(pins);
	if(pinsfromdevice >=0) {
	    respond(response, pinsfromdevice);
	    return;
	}
    }
    responderror(response);	
}

function respond(response, pins)
{
  
    var radiobuttons = new String();
    var pinlabel     = new String();

    log("requestHandlers -- pins are %d", pins);

    // establish html strings

    var head = new String( '<html>' +
			   '<head>'+
			   '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
			   '<title> Powerful PSoC3 board </title>' +
			   '<link href="style.css" rel="stylesheet" type="text/css">' +
			   '</head>' +
			   '<body>' );

    // set up string of radio buttons for each pin, checked or not depending on state 
    radiobuttons+='<div class="firstcolumn">\n';
    for (pin = 1; pin < NUMBERPINS + 1; pin++) {
	if(pin < 10) {
	    pinlabel ='pin' + '0' + pin.toString();
	} else {
	    pinlabel ='pin' + pin.toString();
	}
	if(pin < 17) {
	    pinlabelleft = "";
	    pinlabelright = pinlabel;
	} else {
	    pinlabelleft = pinlabel;
	    pinlabelright = "";
	}

	if(pins & (1 << pin - 1)) {
	    radiobuttons += '<p>' + pinlabelleft +  
		' <input type="radio" name = ' + 'pin' + pin.toString() + ' value="0"' + ' />' + '\n' +
		' <input type="radio" name = ' + 'pin' + pin.toString() + ' value="1" ' + 'CHECKED ' + '/> ' + pinlabelright + '</p>' + '\n';
	} else {
	    radiobuttons += '<p>' + pinlabelleft +  
		' <input type="radio" name = ' + 'pin' + pin.toString() + ' value="0" ' + 'CHECKED ' + '/>\n' +
		' <input type="radio" name = ' + 'pin' + pin.toString() + ' value="1" /> ' + pinlabelright + '</p>' + '\n';
	}
	if(pin == 16)  radiobuttons += '</div>\n<div class="secondcolumn">\n';
    }

    radiobuttons += '</div>';

    var formget = new String('<form  action="/get"  method="get">'+ '\n' +
			
			     '<input class="formbutton" id = "rightbutton" type="submit" value="get" />'+
			     '</form>\n');

    var formset = new String('<form  action="/set"  method="post">'+ '\n' +
			     radiobuttons +
			     '<div class="clear"><br /></div>' +
			     '<input class="formbutton" type="submit" value="set" />' +
                       
			     '</form>\n');

    var footer = new String('<div class="footer">' +
			    '<p>Powerful PSoc3 board</p>\n' +
			    '</div>\n'                                  
			    )

	var footerdeveloper = new String('<div class="footerdeveloper">' +
					 '<form action="/usbdebug" method="get">\n' +
					 '<input class="formbutton" id = "debugbutton" type="submit" value="set usb debug" /></form>\n' +
					 '<a href="www.powerfulboard.com" target="_blank">PowerfulBoard</a>\n' + 
					 '<a href="http://code.google.com/p/powerfulboard" target="_blank" id="rightlink">Software</a></div>\n'
					 )

	// cancatenate strings to define complete page and write to client

	var page = head + '\n' + '<div class="header"><img src="logo.jpg" /></div><div class="content">\n'
	+ formset + formget + '</div>' + footer + footerdeveloper +  '</body></html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(page);
    response.end();
}

function usbdebug(response) {
    console.log("requestHandlers -- usbdebug was called.");
    var error = device.init();
    var returnedlevel = device.setdebug(255);
    get(response);
}

function css(response, postData, pathname)
{
    console.log("requestHandlers -- 'css' was called; path is " + pathname);

    fs.readFile('.' + pathname, function(error, file) {
	    if(error) {
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(error + "\n");
		response.end();
	    } else {
		response.writeHead(200, {"Content-Type": "text/css"});
		response.write(file, "uft-8");
		response.end();
	    }
	});
}

function responderror(response) 
{
    log("responderror    -- sending error report");

    // establish html strings

    var head = new String( '<html>' +
			   '<head>'+
			   '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
			   '<title> Powerful error response </title>' +
			   '<link href="style.css" rel="stylesheet" type="text/css">' +
			   '</head>' +
			   '<body>' );

    var errorreport = new String('<div class="errorreport">' +
				 '<p>No response from usb device</p><p>Is it plugged in?</p>\n' +
				 '</div>\n'                                  
				 )

	var page = head + '\n' + '<div class="header"><img src="logo.jpg" /></div><div class="content">\n'
	+ errorreport +  '</div></body></html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(page);
    response.end();
}

exports.get = get;
exports.set = set;
exports.css = css;
exports.usbdebug = usbdebug;

