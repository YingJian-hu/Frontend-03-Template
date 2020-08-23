
const net = require('net');
const parse = require('./parse');
const images = require('images');
const s = require('/Users/huyingjian/Training/Frontend-03-Template/week04/node_modules/images/vendor/darwin-x64-binding.node')

class Request {
    constructor(options) {
        this.host = options.host;
        this.path = options.path || '/';
        this.method = options.method || 'GET';
        this.port = options.port || 80;
        this.headers = options.headers || {};
        this.body = options.body || {};
        if(!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if(this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        }else if(this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parse = new ReponsePaser;
            if(connection) {
                connection.write(this.toString())
            }else {
                const connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                });
                connection.on('data', (data) => {
                    // console.log(data.toString());
                    parse.receive(data.toString());
                    if(parse.isFinish) {
                        resolve(parse.response);
                        connection.end();
                    }
                });
                connection.on('error', (error) => {
                    reject(error);
                    connection.end();
                })
            }
        })
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

class ReponsePaser {
    constructor() {
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headerName = '';
        this.headerValue = '';
        this.headers = {};
        this.bodyPaser = null;
    }
    receive(string) {
        for(let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    get isFinish() {
        return this.bodyPaser && this.bodyPaser.isFinish
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyPaser.content.join('')
        }
    }
    receiveChar(str) {
        if(this.current === this.WAITING_STATUS_LINE) {
            if(str === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
            }else {
                this.statusLine += str;
            }
        }else if(this.current === this.WAITING_STATUS_LINE_END) {
            if(str === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        }else if(this.current === this.WAITING_HEADER_NAME) {
            if(str === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
                
                //  在所有header收到后需要去找一个‘Transfer-Encoding’决定bodyPaser类型
                if(this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyPaser = new TrunkedBodyPaser();
                }
            }else if(str === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            }else {
                this.headerName += str;
            }
        }else if(this.current === this.WAITING_HEADER_SPACE) {
            if(str === ' ') {
                this.current = this.WAITING_HEADER_VALUE;
            }
        }else if(this.current === this.WAITING_HEADER_VALUE) {
            if(str === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            }else {
                this.headerValue += str;
            }
        }else if(this.current === this.WAITING_HEADER_LINE_END) {
            if(str === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        }else if(this.current === this.WAITING_HEADER_BLOCK_END) {
            if(str === '\n') {
                this.current = this.WAITING_BODY;
            }
        }else if(this.current === this.WAITING_BODY) {
            this.bodyPaser.receiveChar(str);
        }
    }
}

class TrunkedBodyPaser {
    constructor() {
        //  等待返回字符长度（16进制）状态
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;

        //  计算返回字符状态
        this.READING_TRUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;

        this.current = this.WAITING_LENGTH;

        //  返回字符长度
        this.length = 0;

        //  返回字符
        this.content = []
        this.isFinish = false;
    }
    receiveChar(str) {
        if(this.current === this.WAITING_LENGTH) {
            if(str === '\r') {
                if(this.length === 0) {
                    this.isFinish = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            }else {
                //  length为16进制，空出这个str
                this.length *= 16
                this.length += parseInt(str, 16);
            }
        }else if(this.current === this.WAITING_LENGTH_LINE_END) {
            if(str === '\n') {
                this.current = this.READING_TRUNK;
            }
        }else if(this.current === this.READING_TRUNK) {
            this.content.push(str);
            this.length --;
            if(this.length === 0) {
                this.current = this.WAITING_NEW_LINE;
            }
        }else if(this.current === this.WAITING_NEW_LINE) {
            if(str === '\r') {
                this.current = this.WAITING_NEW_LINE_END
            }
        }else if(this.current === this.WAITING_NEW_LINE_END) {
            if(str === '\n') {
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}

void async function() {
    const request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ['X-form']: 'xxxx'
        },
        body: {
            name: 'huyingjian',
            age: 25,
            address: 'chongqing'
        }
    })
    const response = await request.send();

    const dom = parse.parseHtml(response.body);

    const viewport = images(800, 600);

    render(viewport, dom);

    viewport.save('viewport.jpg');
}()