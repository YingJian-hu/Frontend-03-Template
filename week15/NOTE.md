学习笔记

抽象手势模型，状态
+ start => tap：一次点击事件
+ start => 移动10px => pan start => pan(每次一move触发一次pan事件) => pan end
+ start => 移动10px => pan start => pan(每次一move触发一次pan事件) => flick（在end时达到一定的速度，则认为是一次清扫操作）
+ start => 0.5S => press start（长按事件）=> press end
+ start => 0.5S => press start（长按事件）=> 移动10px => pan start => ...

touchmove事件一定是在
触摸事件与鼠标事件有所不同，触摸事件可以有多个点，所以我们有一个event.changedTouches可以获取所有的触摸点，当我们start一个触摸点时，我们却没办法知道是哪个点在move，这时候touch对象里有个identifier属性作为标识，方便我们跟踪它
touchend 和 touchconcel 的区别：touchconcel是以一个异常的模式去结束的（如被alert打断）

用4个方法来抽象手势的几个状态，这样无论是鼠标事件还是触摸事件都被收入到这4个抽象的方法中
```
let start = (point) => {
    //...
}

let move = (point) => {
    //...
}

let end = (point) => {
    //...
}

let cancel = (point) => {
    //...
}
```

设定4个状态，在不同的手势操作中去更改状态
```
let isPan = false, isTap = true, isPress = false;
```

press 通过setTimeOut定时器来实现，在start的手势中，若end事件发生在500ms以外，则触发press事件
```
let start = (point) => {
    startX = point.clientX, startY = point.clientY;

    isTap = true;
    isPan = false;
    isPress = false;

    handler = setTimeout(() => {
        isPress = true;
        isTap = false;
        isPan = false;
        console.log('press');
    }, 500)
}

let end = (point) => {
    if(isTap) {
        console.log('tap');
        clearTimeout(handler);
    }
    // ...
}
```
因鼠标和触屏的模式不同，因此状态放全局上并不合适，在手势操作里传入context，将其状态放在context上，在给触摸屏创建context时，我们只需要用touch对应的identifier来存储它对应的context就好
```
element.addEventListener('touchstart', (event) => {
    for(let touch of event.changedTouches) {
        context.set(touch.identifier, context);
        start(touch, context);
    }
});
```
鼠标去创建context的时候会复杂一定，这里我们首先来分析一下鼠标点击时的场景，可能点击左键，右键，中建，事实上鼠标点击有5个键，也可能同时按下多个键，我们需要对这些键位都依次进行监听，在鼠标按下时，我们可以用evenet.button来获取到它的键位，但是在鼠标move的时候，我们是没有一个evenet.button属性来捕捉它的键位的，因为鼠标本来在不点击的时候move事件都是可以触发的，但是我们有一个event.buttons属性来获取到一个鼠标所按下键位的一个值，这里是一个掩码的设计，用一个二进制来表示所按下的键位，这里我们通过位移的方式来遍历我们所按下的键位。这里还有一个需要注意的地方，在鼠标按下时event.button所对应的中键跟右键的值，跟event,buttons所表示的中键和右键的值是相反的，需要做特殊处理。
```
let context = new Map();
context.set('mouse' + (1 << event.button), context);

start(event, context);
let mousemove = (event) => {
    //  event.buttons表示哪些建被按下来了，由掩码的方式来设计（用一个二级制来表示健按下来的情况）
    let button = 1;

    //  防止移出界
    while(button <= event.buttons) {
        //  如果掩码成立
        if(button & event.buttons) {
            //  event.buttons里的中建与右键的顺序，与event.button中的顺序不一样，因此需要做特殊处理
            let key;
            if(button === 2) {
                key = 4;
            } else if(button === 4) {
                key = 2;
            } else {
                key = button;
            }
            context = context.get('mouse' + key);
            move(event, context);
        }
        button = button << 1;
    }
}
```
为了使我们程序能够稳定运行，当多个鼠标键被按下时，可能在down和up时会发生多次事件的监听，但这里我们并不需要他有多个监听事件，我们只需要在move时去处理多个就可以了，这里我们做一个开关阈值的处理，同时在move时所有键位抬起时清除监听
```
if(!isListeningMouse) {
    element.addEventListener('mousemove', mousemove);
    element.addEventListener('mouseup', mouseup);
    isListeningMouse = true;
}

if(event.buttons === 0) {
    element.removeEventListener('mousemove', mousemove);
    element.removeEventListener('mouseup', mouseup);
    isListeningMouse = false;
}
```
下一步，我们进行事件的派发
```
function dispatch(type, properties) {
    const event = new Event(type);
    for (const name in properties) {
        event[name] = properties[name];
    }
    element.dispatchEvent(event);
}
```
设计flick事件，计算速度，这里我们是将一段事件内的所有点取出来，然后取它的平均速度，这样处理的好处是无论在哪个浏览器下，误差都不会太大，我们取出半秒内经过的所有点的距离，然后求出平均值，只要数值大于1.5，我们则认为触发了flick事件
```
 // 计算速度
let d, v;
context.points = context.points.filter(point => Date.now() - point.t < 500);
if(context.length === 0) {
    v = 0;
}else {
    d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + ((point.clientY - context.points[0].y) ** 2));
}

v = d / (Date.now() - context.points[0].t);

console.log(v);
```

封装 listen => recognize => dispatch，通过实现一个监听器，识别器和一个发射器来实现
```
export class Listener {
    //  ....
}

export class Recognize {
    //  ....
}

export class Dispatcher {
    //  ...
}

export function enableGesture(element) {
    new Listener(element, new Recognize(new Dispatcher(element)));
}
```
