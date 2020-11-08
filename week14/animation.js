const TICK = Symbol('tick');
const HANDLER_TICK = Symbol('handler-tick');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause_start');
const PAUSE_TIME = Symbol('pause-time');

export class Timeline {
    constructor() {
        this.state = 'Inited';
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[PAUSE_START] = new Map();
        this[PAUSE_TIME] = new Map();
    }

    start() {
        if(this.state !== 'Inited')
            return;
        this.state = "started";
        let startTime = Date.now();
        //  开始时暂停时间为0
        let pauseTime = 0;

        this[TICK] = () => {
            let now = Date.now();
            for (const animation of this[ANIMATIONS]) {
                let t;

                //  获取每个animation的暂停时间
                pauseTime = this[PAUSE_TIME].get(animation) || 0;

                //  当动画加入时间大于时间线启动时间时，动画recive时间应该是当前时间减去动画加入时的时间，而且不再是时间线启动时的时间
                if(this[START_TIME].get(animation) < startTime) {
                    t = now - startTime - pauseTime - animation.delay;
                }else {
                    t = now - this[START_TIME].get(animation) - pauseTime - animation.delay;
                }

                //  动画时间结束时，停下动画，处理边界值
                if(animation.duration < t) {
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration;
                }

                //  如果t为负数则认为动画还没开始
                if(t > 0)
                    animation.receive(t);
            }
            this[HANDLER_TICK] = requestAnimationFrame(this[TICK])
        }
        this[TICK]()
    }

    add(animation, startTime) {
        if(arguments.length < 2) {
            startTime = Date.now();
        }
        this[ANIMATIONS].add(animation)

        //  动态添加开始时间
        this[START_TIME].set(animation, startTime);
    }

    pause(animation) {
        if(this.state !== 'started')
            return;
        this.state = "paused";
        //  记录一个暂停开始的时间
        this[PAUSE_START].set(animation,  Date.now());

        cancelAnimationFrame(this[HANDLER_TICK]);
    }

    resume(animation) {
        if(this.state !== 'paused')
            return;
        this.state = "started";
        //  计算出暂停的时间
        //  因为时间线上的时间是从start后一直再走的，所以我们再多次暂定重启时，应该加上前面暂停的时间
        if(!this[PAUSE_TIME].get(animation)) 
            this[PAUSE_TIME].set(animation, Date.now() - this[PAUSE_START].get(animation));
        else 
            this[PAUSE_TIME].set(animation, Date.now() - this[PAUSE_START].get(animation) + this[PAUSE_TIME].get(animation));
        
        this[TICK]();
    }

    reset() {
        this.pause();
        this.start = 'Inited';
        let startTime = Date.now();
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[PAUSE_START] = new Map();
        this[PAUSE_TIME] = new Map();
        this[HANDLER_TICK] = null;
    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, 
        timingFunction = timingFunction || (v => v),
        template = template || (v => v)) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFunction = timingFunction;
        this.template = template;
    }

    //  传入一个虚拟时间，算出当前animation进度
    receive(time) {
        let range = this.endValue - this.startValue;
        let progress = this.timingFunction(time / this.duration);
        this.object[this.property] = this.template((this.startValue + range) * progress);
    }
}