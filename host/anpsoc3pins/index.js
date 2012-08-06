var server = require("./server");
var router =  require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.get;
handle["/get"] = requestHandlers.get;
handle["/set"] = requestHandlers.set;
handle["/usbdebug"] = requestHandlers.usbdebug;
handle["/style.css"] =  requestHandlers.css;
handle["/logo.jpg"] =  requestHandlers.css;

server.start(router.route, handle);
