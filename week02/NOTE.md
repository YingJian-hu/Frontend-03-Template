学习笔记
这一周学习了浏览器原理的部分内容，一下是我对学习内容的一些总结

## 浏览器工作流程
1. 浏览器首先使用HTTP协议或者HTTPS协议，向服务端发起请求
2. 浏览器对所发送的请求进行DNS解析
3. 把请求回来的HTML代码进行解析，构建成DOM树
4. 计算DOM上的CSS属性
5. 根据CSS属性对元素逐个进行渲染，得到内存中的位图
6. 一个可选的步骤是对位图进行合成，这会极大提升后续的绘制速度
7. 合成之后，绘制到页面上

## HTTP协议
### HTTP协议的概念
Http协议是基于TCP协议出现的，在TCP协议的基础上，规定了Request-Responese的模式，这个模式规定了通讯必定是由浏览器端发起的。HTTP是纯文本协议，它规定了使用TCP协议来传输文本格式的一个应用层协议。

### HTTP协议格式
我们在发送一个http请求的时候，会有一个固定的http文本协议的格式如下2图
1. 在请求部分，第一行被称作request line，它分为三部分，HTTP Method，请求路径，请求的协议和版本。紧跟在后面的是请求头，由若干行已k-v形式组成。在头之后以空行为分隔，是请求体，请求体可能包含表单数据和文件。
```
GET / HTTP/1.1
Host: time.geekbang.org
```
2. 在响应部分，第一行被称作 response line，它也分为三个部分，协议和版本、状态码和状态文本。紧跟在后面的是响应头，由若干刚已k-v形式组成。在头之后以空行分隔，是响应体，响应体则为HTML代码。
```
HTTP/1.1 301 Moved Permanently
Date: Fri, 25 Jan 2019 13:28:12 GMT
Content-Type: text/html
Content-Length: 182
Connection: keep-alive
Location: https://time.geekbang.org/
Strict-Transport-Security: max-age=15768000

<html>
<head><title>301 Moved Permanently</title></head>
<body bgcolor="white">
<center><h1>301 Moved Permanently</h1></center>
<hr><center>openresty</center>
</body>
</html>
```
可大概讲HTTP协议按一下划分：
![HTTP协议](https://raw.githubusercontent.com/YingJian-hu/githubImg/master/TrainingGampT/week02/http.jpg)

### HTTP Status code AND Status text
+ 1xx：临时回应，表示客户端请继续
+ 2xx：请求成功
+ 3xx：表示请求的目标有变化，希望客户端进一步处理
    + 301&302：永久性与临时性的重定向
    + 304：跟客户端缓存没有更新
+ 4xx：客户端请求错误
    + 403：无权限访问
    + 404：请求的路径不存在
+ 5xx：服务端请求错误
    + 500：服务端错误
    + 503：服务端暂时性错误，一会再试

### HTTP头
+ Request Header：
    + Accept：浏览器端接收的格式
    + Accept-Encoding：浏览器端接收的编码方式
    + Accept-Language：浏览器端接收的语言，用于服务端判断多语言
    + Cache-Control：控制缓存的时效性
    + Host：HTTP访问使用的域名
    + If-Modified-Since：上次访问时的更改时间，如果服务端认为此时间后自己没有更新，则会给出304响应
    + If-None-Match：上次访问时使用的E-tag，通常是页面的信息摘要，这个比更改时间更准确
    + User-Agent：客户端表示
    + Cookie
+ Response Header：
    + Cache-Control：缓存控制，用于通知各级缓存保存的时间，如max-age=0，表示不需要缓存
    + Connection：链接类型，Keep-Alive表示复用链接
    + Content-Encoding：内容编码方式，通常是gzip
    + Content-Length：内容长度，有利于浏览器判断内容是否已结束
    + Content-Type：内容类型
    + Date： 当前服务器日期
    + ETag：页面信息摘要，用于判断是否需要重新到服务端取回页面
    + Expires：过期时间，用于判断下次请求是否需要到服务端取回页面
    + Keep-Alive：保持连接不断时需要一些信息，如timeout=5，max=100
    + Last-Modified：页面上次修改的时间
    + Server：服务端软件的类型
    + Set-Cookie：设置cookie
    + Via：服务端的请求链路，对一些调试场景至关重要的一个头

### HTTPS
HTTPS 是使用加密通道来传输 HTTP 的内容。但是 HTTPS 首先与服务端建立一条 TLS 加密通道。TLS 构建于 TCP 协议之上，它实际上是对传输的内容做一次加密，所以从传输内容上看，HTTPS 跟 HTTP 没有任何区别。HTTPS可以确定请求的目标服务身份，保证传输的数据不会被网络中间节点窃听或串改。

### HTTP2
相对HTTP1.1最大的改进有两点：一是支持服务端推送，二是支持TCP连接复用

## 有限状态机
+ 每个状态都是一个机器
    + 在每一个机器里，我们可以做计算、存储、输出......
    + 所有的这些机器接受的输入是一致的
    + 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，它应
该是纯函数(无副作用)
+ 每一个机器知道下一个状态
    + 每个机器都有确定的下一个状态(Moore)
    + 每个机器根据输入决定下一个状态(Mealy)