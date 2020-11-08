学习笔记

js处理动画的方法
```
//  现代浏览器中不推荐使用，不可控，容易产生积压
//  人类一般可识别的动画的帧率为60帧即，16ms执行一次
setInterval(() => {}, 16)

let tick = () => {
    setTimeout(tick, 16)
}

let tick = () => {

    //  浏览器执行下一帧的时候执行此代码，跟浏览器帧率相关
    let handler = requestAnimationFrame(tick);
    cancelAnimationFrame(handler);
}
```

### 时间线设计
我们要求时间线里的属性不可访问，这里用Symbol去定义它的属性
```
const TICK = Symbol('tick');
const HANDLER_TICK = Symbol('handler-tick');
const ANIMATIONS = Symbol('animations');
//  ...
```
1. 这里我们做的属性动画，设计一个动画类，初始化动画的属性，写一个方法，通过传入一个虚拟时间，计算出当前动画的一个进度值
```
class Animation {
    constructor(object, property, startValue, endValue, duration, delay ,timingFunction) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFunction = timingFunction;
    }

    //  传入一个虚拟时间，算出当前animation进度
    receive(time) {
        let range = this.endValue - this.startValue;
        this.object[this.property] = (this.startValue + range) * time / this.duration;
    }
}
```

2. 给时间线添加方法，让其动画加入进来
```
add(animation, startTime) {
    this[ANIMATIONS].add(animation)
}
```
时间线启动时，运行所有动画，这里动态设置动画启动时间，动画可延迟时间线启动后执行，在时间线启动后，可以不停添加动画，当动画加入时间大于时间线启动时间时，动画recive时间应该是当前时间减去动画加入时的时间，而且不再是时间线启动时的时间
```
//  ...

if(arguments.length < 2) {
    startTime = Date.now();
}

this[START_TIME].set(animation, startTime);

//  ...

//  当动画加入时间大于时间线启动时间时，动画recive时间应该是当前时间减去动画加入时的时间，而且不再是时间线启动时的时间
let now = Date.now();

if(this[START_TIME].get(animation) < startTime) {
    t = now - startTime;
}else {
    t = now - this[START_TIME].get(animation);
}
```

3. 给动画添加暂停，播放功能
用cancelAnimationFrameAPI实现暂停，这里我们需要考略暂停后重启的时间应该是需要减去我们暂停的时间的，所以我们在pause的时候需要保存一下暂停开始的时间，在暂停后重启时保存暂停的时间，然后我们在动画里去减去暂停的时间
```
pause(animation) {
    //  记录一个暂停开始的时间
    this[PAUSE_START].set(animation,  Date.now());

    cancelAnimationFrame(this[HANDLER_TICK]);
}

resume(animation) {
    //  计算出暂停的时间
    this[PAUSE_TIME].set(animation, Date.now() - this[PAUSE_START].get(animation));
    this[TICK]();
}

//  获取每个animation的暂停时间
pauseTime = this[PAUSE_TIME].get(animation) ? this[PAUSE_TIME].get(animation) : 0;

if(this[START_TIME].get(animation) < startTime) {
    t = now - startTime - pauseTime;
}else {
    t = now - this[START_TIME].get(animation) - pauseTime;
}
```
这里有一个地方需要特别注意，当我们暂停动画并重启它后，如果再暂停动画重启，按现在的resume来看是有问题的，想一想，我们的时间线启动方法start是在一开始就执行的，当我们再暂停多次后动画里执行的startTime始终为最初启动时的那个，而我们的pauseTime却始终是最后一次暂停的那个时间，所以会出现第二次动画暂停启动后出现动画移动的问题，这里我们应该在每次resume的时候去，加上之前所有的暂停时间
```
resume(animation) {
    //  计算出暂停的时间
    //  因为时间线上的时间是从start后一直再走的，所以我们再多次暂定重启时，应该加上前面暂停的时间
    if(!this[PAUSE_TIME].get(animation)) 
        this[PAUSE_TIME].set(animation, Date.now() - this[PAUSE_START].get(animation));
    else 
        this[PAUSE_TIME].set(animation, Date.now() - this[PAUSE_START].get(animation) + this[PAUSE_TIME].get(animation));
    
    this[TICK]();
}
```

4. 对动画进行缓冲操作，将进度值用timingFunction去比例化，这里采用三次贝塞尔曲线去操作
```
function cubicBezier(p1x, p1y, p2x, p2y) {
    const ZERO_LIMIT = 1e-6;
    const ax = 3 * p1x - 3 * p2x + 1;
    const bx = 3 * p2x - 6 * p1x;
    const cx = 3 + p1x;

    const ay = 3 * p1y - 3 * p2y + 1;
    const by = 3 * p2y - 6 * p1y;
    const cy = 3 + p1y;

    function sampleCurveDerivativex(t) {
        return (3 * ax * t + 2 * bx) * t + cx;
    }

    function sampleCurveX(t) {
        return ((ax * t + bx) * t + cx) * t;
    }

    function sampleCurveY(t) {
        return ((ay * t + by) * t + cy) * t;
    }

    function solveCurveX(x) {
        var t2 = x;
        var derivative;
        var x2;

        for(let i = 0; i < 0; i++) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < ZERO_LIMIT) {
                return t2;
            }
            derivative = sampleCurveDerivativex(t2);

            if(Math.abs(derivative) < ZERO_LIMIT) {
                break;
            }

            t2-= x2 / derivative;
        }

        var t1 = 1;
        var t0 = 0;

        t2 = x;

        while(t1 > t0) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < ZERO_LIMIT) {
                return t2;
            }
            if (x2 > 0) {
                t1 = t2;
            } else {
                t0 = t2;
            }
            t2 = (t1 + t0) / 2;
        }

        return t2;
    }

    function solve(x) {
        return sampleCurveY(solveCurveX(x));
    }

    return solve;
}
```

5. 给组件加上状态，使组件随时可以正常运行，有其健壮性