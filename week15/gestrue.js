//  listen => recognize => dispatch
//  new Listener(element, new Recognize(new Dispatcher(element)))

export class Dispatcher {
    constructor(element) {
        this.element = element;
    }

    dispatch(type, properties) {
        const event = new Event(type);
        for (const name in properties) {
            event[name] = properties[name];
        }
        this.element.dispatchEvent(event);
    }
}

export class Listener {
    constructor(element, recognizer) {
        let isListeningMouse = false;
        let context = new Map();

        element.addEventListener('mousedown', event => {
            let context = new Map();
            context.set('mouse' + (1 << event.button), context);
        
            recognizer.start(event, context);
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
                        recognizer.move(event, context);
                    }
                    button = button << 1;
                }
            }
        
            let  mouseup = (event) => {
                context = context.get('mouse' + (1 << event.button));
                recognizer.end(event, context);
                context.delete('mouse' + (1 << event.button));
        
                //  当按键全部放开时重置
                if(event.buttons === 0) {
                    document.removeEventListener('mousemove', mousemove);
                    document.removeEventListener('mouseup', mouseup);
                    isListeningMouse = false;
                }
            }
        
            //  不然其发生多次监听
            if(!isListeningMouse) {
                document.addEventListener('mousemove', mousemove);
                document.addEventListener('mouseup', mouseup);
                isListeningMouse = true;
            }
        })

        element.addEventListener('touchstart', (event) => {
            for(let touch of event.changedTouches) {
                context.set(touch.identifier, context);
                recognizer.start(touch, context);
            }
        });
        
        element.addEventListener('touchmove', (event) => {
            for(let touch of event.changedTouches) {
                context = context.get(touch.identifier);
                recognizer.move(touch, context);
            }
        });
        
        element.addEventListener('touchend', (event) => {
            for(let touch of event.changedTouches) {
                context = context.get(touch.identifier);
                recognizer.end(touch, context);
                context.delete(touch.identifier);
            }
        })
        
        //  异常结束touch
        element.addEventListener('touchcancel', (event) => {
            for(let touch of event.changedTouches) {
                context = context.get(touch.identifier);
                recognizer.cancel(touch, context);
                context.delete(touch.identifier);
            }
        })
    }
}

export class Recognize {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    start(point, context) {
        context.startX = point.clientX, context.startY = point.clientY;
        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        }]
    
        context.isTap = true;
        context.isPan = false;
        context.isPress = false;
    
        context.handler = setTimeout(() => {
            context.isPress = true;
            context.isTap = false;
            context.isPan = false;
            this.dispatcher.dispatch('press', {})
        }, 500)
    }

    move(point, context) {
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
    
        //  判断是否移动了10px，进入到Pan状态，同时清除press
        if(!context.isPan && dx ** 2 + dy ** 2 > 100) {
            context.isPan = true;
            context.isPress = false;
            context.isTap = false;
            context.handler = null;
            context.isVerical = Math.abs(dx) < Math.abs(dy);
            this.dispatcher.dispatch('panstart', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,

                //  区分上下划还是左右划
                isVerical: context.isVerical
            })
            clearTimeout(context.handler);
        }
    
        if(context.isPan) {
            this.dispatcher.dispatch('pan', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerical: context.isVerical
            })
        }
    
        context.points = context.points.filter(point => Date.now() - point.t < 500);
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        });
    }

    end(point, context) {
        if(context.isTap) {
            this.dispatcher.dispatch('tap', {});
            clearTimeout(context.handler);
        }
        if(context.isPress) {
            this.dispatcher.dispatch('pressend', {});
        }
    
        // 计算速度
        let d, v;
        context.points = context.points.filter(point => Date.now() - point.t < 500);
        if(context.length === 0) {
            v = 0;
        }else {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + ((point.clientY - context.points[0].y) ** 2));
        }
    
        v = d / (Date.now() - context.points[0].t);
    
        if(v > 1.5) {
            context.isFlick = true;
            this.dispatcher.dispatch('flick', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerical: context.isVerical,
                isFlick: context.isFlick,
                velocity: v //  速度
            })
        }

        if(context.isPan) {
            this.dispatcher.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVerical: context.isVerical,
                isFlick: context.isFlick
            })
        }
    }

    cancel (point, context) {
        clearTimeout(context.handler);
        this.dispatcher.dispatch('cancel', {})
    }
}

//  一体化处理fangfa
export function enableGesture(element) {
    new Listener(element, new Recognize(new Dispatcher(element)));
}