const http = require('http');

http.createServer(function (req, res) {
	res.write("On the way on being a full stack engineer!!");
	res.end();
}).listen(3000);	

console.log('Server running on port 3000');
