import { Component, createElement } from './framework.js'

class Carousel {
    constructor() {
        this.attributes = Object.create(null);
    }
    setAttribute(name, value) {
        this.attributes[name] = value;
    }
    render() {
        this.root = document.createElement('div');
        this.root.classList.add('carousel')
        for (const record of this.attributes.src) {
            let child = document.createElement('div');
            child.style.backgroundImage = `url(${record})`;
            child.src = record;
            this.root.appendChild(child);
        }

        let position = 0;

        this.root.addEventListener('mousedown', event => {
            let children = this.root.children;
            let startX = event.clientX;

            let move = event => {
                let x = event.clientX - startX;

                let current = position - Math.round((x - x % 512) / 512);

                for(const offset of [-1, 0, 1]) {
                    let pos = current + offset

                    //  取余运算处理循环
                    pos = (pos + children.length) % children.length;

                    children[pos].style.transition = 'none';

                    //  -pos * 512 减去自己的位置
                    //  offset * 512 刚到对应的位置
                    children[pos].style.transform = `translateX(${- pos * 512 + offset * 512 + x % 512}px)`;
                }
            }
            let up = event => {
                let x = event.clientX - startX;
                position = position - Math.round(x / 512);
                for(const offset of [0, - Math.sign(Math.round(x / 512) - x + 250 * Math.sign(x))]) {
                    let pos = position + offset

                    //  取余运算处理循环
                    pos = (pos + children.length) % children.length;

                    children[pos].style.transition = '';
                    children[pos].style.transform = `translateX(${- pos * 512 + offset * 512}px)`;
                }
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        })

        /**
         * 自动播放
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

            //  16ms为浏览器上一帧的时间
            setTimeout(() => {
                next.style.transition = '';
                current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
                next.style.transform = `translateX(${ - nextIndex * 100}%)`;
                currentIndex = nextIndex;
            }, 16)
        }, 3000)
        */

        return this.root;
    }
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}

let d = [
    'file:///Users/huyingjian/Training/Frontend-03-Template/week13/jsx/img/1.jpeg',
    'file:///Users/huyingjian/Training/Frontend-03-Template/week13/jsx/img/2.jpeg',
    'file:///Users/huyingjian/Training/Frontend-03-Template/week13/jsx/img/3.jpeg',
    'file:///Users/huyingjian/Training/Frontend-03-Template/week13/jsx/img/4.jpeg'
]

let carousel = <Carousel src={d}/>;

carousel.mountTo(document.body);