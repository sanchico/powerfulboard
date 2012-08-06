
var http = require("http");
var url  = require("url");


function start(route, handle) {
    function onRequest(request, response) {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
        console.log("onRequest       -- request for " + pathname + " received.");
        request.setEncoding("utf8");
        request.addListener("data", function(postDataChunk) {
	  postData += postDataChunk;
          console.log("onRequest       -- received POST data chunk '"+
		      postDataChunk + "'.");
	    });

        request.addListener("end", function() {
        route(handle, pathname, response, postData);
	    });
    
    }
   http.createServer(onRequest).listen(8888);
   console.log("server          -- server has started.");
}

exports.start = start;
