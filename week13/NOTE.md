学习笔记

### 组件基础介绍
+ 对象
    + Properites 属性
    + Method 方法
    + Inherit 继承关系

+ 组件
    + Properites 属性
    + Method 方法
    + Inherit 继承关系
    + Attribute 特性
    + Config & State 配置和状态
    + Event 事件机制
    + Lifecycle 声明周期
    + Children 树形结构的必要性

1. Attribute && Property
有时候attribute是个字符串，property是一个字符串语义化的对象，如style，href，value
```
let div = document.getElementByTagName('div')
div.style //    对象，key => value 结构

let a = document.getElementByTagName('a')
a.href //   'http://m.taobao.com'   这URL是resolve过的结果（输入//xxxx.com Resolve后根据当前页面协议加上协议 xxxx://xxx.com） => Property
a.getAttribute('href')  //  //m.taobao.com  跟HTML代码里保持一致 => attribute

//  input的attribute的val是input的默认值，无论input框的值后期如何改变，attribute的val值不变
let input = document.getElementByTagName('input')
input.value // cute
input.getAttribute('value') // cute
input.value = 'hello' // 若value属性已设置，则attribute不变，property变化，实际显示效果property优先
input.value // hello
input.getAttribute('value') // cute
```

2. 如何设计组件
+ preoperty不能够被标签改变去设置，可以被js设置改变，大多数情况下不应该被用户输入所改变
+ attribute可以被标签，静态语言设置，可以被js设置改变，大多数情况下不应该被用户输入所改变
+ state只能从组件内部去改变，而不能受组件外部去改变，用户输入应该可以去改变state
+ config是一个一次性结果，它只有在组件构造的时候去触发，它能够一次性被传进来，但是不可更改的，通常把config留给全局

3. 生命周期
+ 任何组件都必须有的2个生命周期：created，destroyed
+ 一个组件要显示到屏幕的树上，应该有个mount（挂载），以及unmount（卸载），这两个生命周期会反复发生
+ 当组件的终端用户输入或者组件使用这修改代码的时候会改变组件状态，此时应该有一个组件的update（更新周期）

4. Children
+ Content型，有几个children就显示几个children
+ Template型，充当一个模板的作用，显示一个结构

### 为组件添加JSX语法
1. 安装jsx支持依赖，并修改配置
```
// @babel/core  @babel/preset-env为babel运行依赖， @babel/plugin-transform-react-jsx为jsx依赖
npm install babel-loader @babel/core @babel/plugin-transform-react-jsx @babel/preset-env --save-dev

//  在webpack配置中，将jsx方法由React.createElment改为createElment
plugins: [["@babel/plugin-transform-react-jsx", {pragma: "createElement"}]]
```
2. 根据createElment渲染参数完善渲染方法，createElment为一个递归调用，第一个参数为需要渲染的dom名或组件名，第二个是个options，里面是dom或组件的属性，后面的参数则为dom或组件里的children，如要渲染一个div标签里嵌套1个span标签1个p标签则为
```
createElement('div', {
    id: 'oDiv'
}, createElement('span', null, 'hello')
, createElement('p', {
    id: 'oP’
}, 'word'))
```
我们根据渲染参数来完善渲染方法，这里需要额外处理组件的情况（<Div>），传入的不在是普通的标签名，而是一个Class，为了同步组件的挂载方法，我们将普通标签与文本的渲染函数进行改造，并赋予一个继承基类来优化代码
```
function createElement(type, attributes, ...children) {
    let element = null;
    if(typeof type === 'string') {
        element = document.createElement(type);
    }else {
        element = new type;
    }

    for(let name in attributes) {
        element.setAttribute(name, attributes[name]);
    }
    for(let child of children) {
        if(typeof child === 'string') {
            child = new ElementTextWrapper(child);
        }
        child.mountTo(element);
    }
    return element;
}

class ElementWrapper extends Component{
    constructor(type) {
        this.root = document.createElement(type);
    }
}

class ElementTextWrapper extends Component{
    constructor(text) {
        this.root = document.createTextNode(text);
    }
}
```

### 轮播组件
做轮播图，我们的思路是：在一个正常流里面，并排着4张图片，每三秒，移动一下图片的位置，这里为了能实现无限轮播，我们将只操控当前图片和下一张图片的位移，因为在轮播的过程中，实际上我们能感受到的只有2张图片在交互替换。
轮播动画样式，通过CSS ease实现
```
.carousel > div{
    width: 512px;
    height: 384px;
    background-size: contain;
    display: inline-block;

    /* 进入一般ease，退出ease-in liner很少用到*/
    transition: ease 0.5s;
}
```
#### 自动播放
设置两个变量代表当前图片（current）和下一张图片（next），下一张突破的位置，始终为当前图片位置加100%，因为是无限轮播，这里我们在定义时需要减去偏移量
```
let currentIndex = 0;
setInterval(() => {
    let children = this.root.children;
    let nextIndex = (currentIndex + 1) % children.length;

    let current = children[currentIndex];
    let next = children[nextIndex];

    //  挪到正确的位置
    //  next的位置为当前位置加上100%，需要减去原有的偏移量
    next.style.transition = 'none';
    next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

    //  ...
}, 3000)
```
然后我们开始轮播，current位置移动到-100%的位置时，next移动到0，同时nextIndex替换掉currentIndex，这里为了给初始化的next增加偏移区分开来，用一个很短的异步去执行轮播，我们在next初始化时的transform是不需要看到动画的
```
//...

setTimeout(() => {
    next.style.transition = '';
    current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
    next.style.transform = `translateX(${ - nextIndex * 100}%)`;
    currentIndex = nextIndex;
}, 16)
```
#### 拖拽播放
通过拖拽位移来实现播放，这里在拖拽的时候需要关闭动画效果，同时拖拽的时候计算契合度，当拖拽契合度满足时，播放到下一页，否则回到上一页
```
 this.root.addEventListener('mousedown', event => {
    let children = this.root.children;
    let startX = event.clientX;

    let move = event => {
        let x = event.clientX - startX;

        //  拖拽时关闭动画效果，只有位移
        for (const child of children) {
            child.style.transition = 'none';
            child.style.transform = `translateX(${- position * 512 + x}px)`;
        }
    }
    let up = event => {
        let x = event.clientX - startX;

        //  计算契合度
        position = position - Math.round(x / 512);
        for (const child of children) {
            child.style.transition = '';
            child.style.transform = `translateX(${- position * 512}px)`;
        }
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
})
```
拖拽循环播放，使它始终在[-1, 0, 1]三个图片中移动，移动的时候需要先减去自己的位置，加上应该放入的位置再加上拖动偏移量
```
for(const offset of [-1, 0, 1]) {
    let pos = current + offset

    //  取余运算处理循环
    pos = (pos + children.length) % children.length;

    children[pos].style.transition = 'none';

    //  -pos * 512 减去自己的位置
    //  offset * 512 刚到对应的位置
    children[pos].style.transform = `translateX(${- pos * 512 + offset * 512 + x % 512}px)`;
}
```
