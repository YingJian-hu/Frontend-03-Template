const http = require('http');
const fs = require('fs');

http.createServer((request, response) => {
    let body = [];
    request.on('error', (error) => {
        console.error(error.message)
    }).on('data', (chunk) => {
        console.log(chunk.toString())
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body: ', body)
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(fs.readFileSync('./flex-layout.html'));
    });
}).listen(8088);