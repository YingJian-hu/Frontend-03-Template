学习笔记

## HTML
DTD（文档类型定义）是SGML规定的定义它的子集的一种文档格式，HTML 属于 SGML，在 HTML5 出现之前，HTML 都是使用符合 SGML 规定的 DTD
```
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> // 严格模式
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"> // 过渡模式
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd"> // frameset模式    
```
当使用nbsp去链接2个词的时候，它会认为是一个词，没法把词分开，在排版的时候就会出现分词的问题，可以通过CSS的white-space去显示空格
“quot（""）”写在html属性里会抛错，“amp（&）”，“lt（<）”，“gt（>）”写在html里会抛错，需要&xx;转义

### HTML标签语义
+ 语义标签的意义
    + 语义类标签对开发者更为友好，使用语义类标签增强了可读性，即便是在没有 CSS 的时候，开发者也能够清晰地看出网页的结构，也更为便于团队的开发和维护
    + 语义类标签也十分适宜机器阅读。它的文字表现力丰富，更适合搜索引擎检索（SEO），也可以让搜索引擎爬虫更好地获取到更多有效信息，有效提升网页的搜索量，并且语义类还可以支持读屏软件，根据文章可以自动生成目录等等

+ 语义标签的使用场景
    + 作为自然语言和纯文本的补充，用来表达一定的结构或者消除歧义（如：“ruby”的英法）
    + 还有一种情况是，HTML 的有些标签实际上就是必要的，甚至必要的程度可以达到：如果没有这个标签，文字会产生歧义的程度（如：em表示重音，可消除歧义）

+ 常用语义标签
    + header: 头部
    + footer: 底部
    + aside：非主体部分，侧边栏等
    + main：页面主体部分，在整个页面只有一个
    + article：来自外部的内容，如一篇文章，一段blog文本等
    + hgroup：标题组合
    + abbr：简称，缩写
    + strong：强调，表示这个词文章中的重要性的一个场景
    + em：强调，表示这个词在这句话中的重音，重点
    + figure：用于文档中插图的图像
        + figcaption 图像的标题
    + nav：导航
    + dfn：表示对特殊术语或短语的定义
    + pre：预格式化的文本
    + samp：举例
    + code：对文本进行格式化（代码）
    + address：文字作者的联系地址
    + ...

### HTML语法
+ 合法元素
    + Element: ```<tagName></tagName>```
    + Text: ```text```
    + Comment: ```<!-- components -->```
    + DocumentType: ```<!Doctype html>```
    + ProcessingInstruction: ```<?a 1?>```
    + CDATA: ```<!CDATA[]>```

+ 字符引用
    + &#161;
    + &amp;
    + &it;
    + &quot;

### head里的标签
+ title：表示文档的标题
+ base：一个历史遗留标签，它的作用是给页面上所有的 URL 相对地址提供一个基础，base 标签最多只有一个，它改变全局的链接地址，它是一个非常危险的标签，容易造成跟 JavaScript 的配合问题，建议用javaScript来代替使用
+ meta：它是一组键值对，是一种通用的元信息表示标签
    + 具有charset属性：描述 HTML 文档自身的编码形式，建议放在head的第一个
    + 具有http-equiv属性：表示执行一个命令
        + content-type：指定报文类型
        + content-language：指定内容语言
        + default-style：指定默认样式表
        + refresh：刷新
        + set-cookie：模拟http头的set-cookie，设置cookie
        + x-ua-compatible：模拟http头的x-ua-compatible，声明 ua 兼容性
        + content-security-policy：模拟http头的content-security-policy，声明安全策略
    + name为viewport：这类 meta 的 name 属性为 viewport，它的 content 是一个复杂结构，是用逗号分隔的键值对，键值对的格式是 key=value
        + width；页面宽度，可以取值具体的数字，也可以是 device-width，表示跟设备宽度相等
        + height：页面高度，可以取值具体的数字，也可以是 device-height，表示跟设备高度相等
        + initial-scale：初始缩放比例
        + minimum-scale：最小缩放比例
        + maximum-scale：最大缩放比例
        + user-scalable：是否允许用户缩放
    + 其它预定义的meta
        + author: 页面作者
        + description：页面描述，这个属性可能被用于搜索引擎或者其它场合
        + generator: 生成页面所使用的工具，主要用于可视化编辑器，如果是手写 HTML 的网页，不需要加这个 meta
        + keywords: 页面关键字，对于 SEO 场景非常关键
        + referrer: 跳转策略，是一种安全考量
        + theme-color: 页面风格颜色，实际并不会影响页面，但是浏览器可能据此调整页面之外的 UI（如窗口边框或者 tab 的颜色）

### 链接标签
+ link：它会生成一个链接，它可能生成超链接，也可能生成外部资源链接。链接类型通过“rel”属性来区分
    + 超链接link型：作为超链接型的link标签不会产生任何作用，但能够被搜索引擎和一些浏览器插件识别，从而产生关键性作用（到页面 RSS 的 link 标签，能够被浏览器的 RSS 订阅插件识别，提示用户当前页面是可以 RSS 订阅的）
        + canonical：这个标签提示页面它的主URL，告诉搜索引擎访问时在去掉重复页面时保留哪一个URL
        + alternate：提示页面它的变形形式，页面提供 rss 订阅时，可以用这样的 link 来引入
        + prev、next：告诉搜索引擎或者浏览器它的前一项和后一项
        + author：链接到本页面的作者，一般是 mailto: 协议
        + help：链接到本页面的帮助页
        + license：链接到本页面的版权信息页
        + search：链接到本页面的搜索页面（一般是站内提供搜索时使用）
    + 外部资源类link型：外部资源型 link 标签会被主动下载，并且根据 rel 类型做不同的处理
        + icon：表示页面的 icon，icon 型 link 中的图标地址默认会被浏览器下载和使用，如果没有指定这样的 link，多数浏览器会使用域名根目录下的 favicon.ico，从性能的角度考虑，建议一定要保证页面中有 icon 型的 link
    + 预处理类
        + dns-prefetch：提前对一个域名做dns查询
        + preconnect：提前对一个服务器建立 tcp 连接
        + prefetch：提前取 href 指定的 url 的内容
        + preload：提前加载 href 指定的 url
        + prerender：提前渲染 href 指定的 url
        + modulepreload：预先加载（完成下载并放入内存）一个 JavaScript 的模块

+ a：标识文档中的特定位置，（rel）
    + alternate
    + author
    + help
    + license
    + search
    + pre、next
    + tag：表示本网页所属的标签
    + bookmark：到上级章节的链接
    + nofollow：此链接不会被搜索引擎索引
    + noopener：此链接打开的网页无法使用 opener 来获得当前页面的窗口
    + noreferrer：此链接打开的网页无法使用 referrer 来获得当前页面的 url
    + opener 打开的网页可以使用 window.opener 来访问当前页面的 window 对象

+ area：区域型的链接

### API

#### DOM API
+ 节点（Node） API
    + Element：元素型节点，跟标签相对应
        + HTMLElement
            + HTMLAnchorElement => a
            + HTMLAreaElement => area
            + HTMLBodyElement => body
            + ...
        + SVGElement
            + SVGAElement
            + SVGAltGlyphElement
            + ...
    + Document：文档根节点
    + CharacterData：字符数据
        + Text：文本节点
            + CDATASelection：CDATA节点
        + Comment：注释
        + ProcessingInstruction：处理信息
    + DocumentFragment：文档片段
    + DocumentType：文档类型

+ 高级操作
    + compareDocumentPosition: 用于比较两个节点中关系的函数，返回一个10进制的掩护码
        + DOCUMENT_POSITION_DISCONNECTED（1）：不在统一文档中
        + DOCUMENT_POSITION_PRECEDING（2）：otherNode在node之前
        + DOCUMENT_POSITION_FOLLOWING（4）：otherNode在node之后
        + DOCUMENT_POSITION_CONTAINS（8）：otherNode包含node
        + DOCUMENT_POSITION_CONTAINED_BY（16）：otherNode被node包含
    + contains：检查一个节点是否包含另外一个节点的函数
    + isEqualNode：检查两个节点是否完全相同
    + isSameNode：检查两个节点是否是同一个节点
    + cloneNode：复制一个节点，如果传入true，则会连同子元素作深拷贝

#### 事件 API
+ addEventListener
    + options.captrue：控制它是冒泡模式还是捕获模式
    + options.passive：是否是一个不会产生副作用的事件，高屏次事件触发加入passive可以提升性能

#### Range API
+ range.setStartBefore
+ range.setStartAfter
+ range.setEndBefore
+ range.setEndAfter
+ range.setSelectNode
+ range.setSelectNodeContent（可以选中一个元素的所有内容）
+ range.extractContents：取出range里的元素，返回的是个fragment对象，在append的时候，不会把自己append进去，而是append它的子节点，fragment被append不需要发生重排（脱离了文档流），性能较高

### CSSOM -> 对应CSS语法

#### Rules
```
//  获取rule
document.styleSheets[0].cssRules

//  插入rule，第二个参数是位置
document.styleSheets[0].insertRule("p {color: pink}", 0)

//  删除rule
document.styleSheets[0].removeRule(0)
```

通过CSSOM来修改样式相对于修改style属性的好处：
+ 可以批量修改
+ 可以修改伪元素样式

getComputedStyle可获取元素与伪元素的真实计算属性，可去操作一些CSS变化中的中间值（如动画）

#### Window
+ *window.innerHeight, window.innerWidth：代表了我们实际上使用的viewport，html内容实际上渲染所用的区域
+ window.outerWidth, window.outerHeight：包含了浏览器自带的工具栏，浏览器窗口总共所占尺寸
+ *window.devicePixelRation：屏幕上的物理像素跟我们代码里的逻辑像素px的比值
+ window.screen
    + width，height：实际上的屏幕宽高
    + avaliWidth，avaliHeight：可使用（可设置硬件相关，例如有的安卓机上会有可操作按钮）的宽和高

#### Scroll
+ scrollTop：当前滚动高度
+ scrollLeft：当前滚动宽度
+ scrollWidth：可滚动内容的宽度
+ scrollHeight
+ scroll(x, y)：滚动到特定位置
+ scrollBy(x, y)：当前基础上滚动一个差值
+ scrollIntoView(x, y )：强制元素滚动到屏幕的可见区域

#### Layout
+ getClientRects：获取一个元素生成的所有盒
+ getBoundingClientRect：取出一个元素所有的盒所包含的区域