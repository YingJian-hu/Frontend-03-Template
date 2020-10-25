学习笔记
这周主要学习了Proxy的应用，以及用range在正常流里实现拖拽，以下是我的学习总结

1. Proxy
Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改。Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。

一般对Proxy的使用，会将它封装在一个函数里作为返回值返回，例如一个Promise。
```
function reactive() {
    return new Proxy();
}
```
这里我们用一个Vue3的reactive工具包得实现来介绍Proxy的使用；reactive接收一个普通对象然后返回该普通对象的响应式代理，返回的代理对象不等于原始对象，建议仅使用代理对象而避免依赖原始对象。

我们会有一个存放响应函数的空间callbacks，因可能存在多个对象需要响应，被监听，因此在存放callbacks的数据结构上我们不能用数组，不然在响应函数调用时我们无法判断是来自那个对象那个属性发起的响应请求，这里我们用Map来存放callbacks，其中套2层，第一层的属性为当前监听的对象，第二层的属性为当前监听对象的属性，这个属性对应的才是它需要响应的回调方法callback。
```
for (const reactivity of useReactivites) {
    if(!callbacks.has(reactivity[0])) {
        //  放2层，第一层对象，第二层属性才对应callback
        callbacks.set(reactivity[0], new Map());
    }

    if(!callbacks.get(reactivity[0]).has(reactivity[1])) {
        callbacks.get(reactivity[0]).set(reactivity[1], []);
    }

    callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
}
```
但是我们要在哪一步去注册我需要监听的对象和属性呢，这里我们开始用到Proxy的特性，在get方法里去注册它访问的属性，我们会在监听函数中先去调用一次监听回调，这里触发了监听对象的属性访问，同时将它注册到我们需要监听的集合useReactivites中。
```
function effect(callback) {
    callback();
    /// ...
}

function reactive() {
    // ... 
    get(obj, prop, val) {
        //  访问属性时，将对应属性注册进useReactivites
        useReactivites.push([obj, prop]);

        //  处理po.a.b的情况，当我们监听到val是个对象的时候
        if(typeof obj[prop] === 'object') {
            return reactive(obj[prop]);
        }

        return obj[prop];
    }
}
```
现在我们已经成功将想要监听的数据存放在对应的数据结构中，现在，当我们在箭筒函数中使用重设监听对象的属性的时候，就会触发相应的监听回调函数了
```
function reactive() {
    // ... 
    set(obj, prop, val) {
        obj[prop] = val;
        if(callbacks.get(obj)) {
            if(callbacks.get(obj).get(prop)) {
                for (const callback of callbacks.get(obj).get(prop)) {
                    callback();
                }
            }
        }
        return obj[prop];
    }
    //  ... 
}
```
这里，在我们监听对象的属性也是一个对象时（如Po.x.y的访问情况），需要做递归的特殊处理
```
if(typeof obj[prop] === 'object') {
    return reactive(obj[prop]);
}
```

2. 正常流中用range实现drag拖拽
首先写正常的拖拽，用mousedown，mousemove，mouseup模拟拖拽功能，mousemove，mouseup需要在mousedown的监听事件中实现，并且mousemove，mouseup需要监听的是document对象，为什么不是drag？因为我们在拖拽的过程中，计算机计算速度可能跟不上我们操作的速度，鼠标会拖拽出drag，导致mousemove，mouseup失效
```
dragable.addEventListener("mousedown", function(event) {
    //  ...
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
})
```
要实现将拖拽的DOM插入随拖拽插入正常流中，首先我们需要在所有正常流的节点位置插入range
```
for(let i = 0; i < container.childNodes[0].textContent.length; ++i) {
    let range = document.createRange();
    range.setStart(container.childNodes[0], i);
    range.setEnd(container.childNodes[0], i);
    
    ranges.push(range);
}
```
我们在mousemove的过程中，不停的去找距离当前光标点最近的range的位置，并将此dragable插入到range中，要想找到距离那个range最近，首先我们需要知道所有range的位置，这里用CSSOM的APIgetBoundingClientRect获取range的位置
```
let move = event => {
    let range = getNearest(event.clientX, event.clientY);
    range.insertNode(dragable);
}

function getNearest(x, y) {
    let min = Infinity;
    let nearest = null;

    //  用CSSOM获range的位置
    for(let range of ranges) {
        let rect = range.getBoundingClientRect();
        let distance = (rect.x - x) ** 2 + (rect.y - y) ** 2;
        if(distance < min) {
            nearest = range;
            min = distance;
        }
    }

    return nearest;
}
```