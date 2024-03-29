function route(handle, pathname, response, postData) {
    console.log("router          -- about to route a request for " + pathname);
    if (typeof handle[pathname] === 'function') {
	handle[pathname](response, postData, pathname);
       } else {
           console.log("router          -- no request handler found for " + pathname);
           response.writeHead(404, {"Content-Type": "text/plain"});
           response.write("404 Not found");
           response.end();
        }
}
exports.route = route;

