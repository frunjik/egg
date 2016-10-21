'use strict';
var fs = require('fs');
var url = require('url');
var http = require('http');
var port = 8124;

function mimetypefor(filename) {
	var parts = filename.split('.');
    if(parts.length === 1) { return 'text/html'; }
    var extension = parts[parts.length-1];
    var result = {
    	"css": "text/css",
    	"html": "text/html",
    	"js": "text/html",
    	"json": "text/json",
    }[extension];
    return result;
}

http.createServer(function(request, response) {
    
    var fragments = url.parse(request.url, true);
    var pathname = fragments.pathname;
    
    if (pathname === '/api/files/get') {
	    var filename = './' + fragments.query.name;
        fs.readFile(filename, function(err, data) {
            if (err) {
                data = JSON.stringify(err);
                response.writeHead(400, {'Content-Type': 'text/html'});
                response.end(data);
            } else {
	        	var mimetype = mimetypefor(filename); 
	        	response.writeHead(200, {'Content-Type': mimetype});
    	        response.end(data);
            }
        });
    } else if (pathname === '/api/files/put') {
	    var filename = './' + fragments.query.name;
        var data = '';
        request.on('data', function(chunk){
            data += chunk;
        });
        request.on('end', function(){
            fs.writeFile(filename, data, function(err) {
                if (err) {
                    response.writeHead(400, {'Content-Type': 'text/json'});
                    response.end(JSON.stringify(err));
                } else {
                    response.writeHead(200, {'Content-Type': 'text/json'});
                    response.end(JSON.stringify({}));
                }
            });
        });
    } else {
        fs.readFile('./' + pathname, function(err, data) {
            if (err) {
            	response.writeHead(400, {'Content-Type': 'text/html'});
              	response.end(JSON.stringify(err));
            } else {
	        	var mimetype = mimetypefor(pathname); 
              	response.writeHead(200, {'Content-Type': mimetype});
              	response.end(data);
            }
        });
    }
}).listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');

