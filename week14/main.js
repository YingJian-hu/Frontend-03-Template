import { Component, createElement } from './framework.js'
import { Carousel } from './carousel.js';
import { Timeline, Animation } from './animation.js';

let d = [
    'file:///Users/huyingjian/Training/Frontend-03-Template/week14/img/1.jpeg',
    'file:///Users/huyingjian/Training/Frontend-03-Template/week14/img/2.jpeg',
    'file:///Users/huyingjian/Training/Frontend-03-Template/week14/img/3.jpeg',
    'file:///Users/huyingjian/Training/Frontend-03-Template/week14/img/4.jpeg'
]

let carousel = <Carousel src={d}/>;

window.tt = new Timeline();
window.animation = new Animation({set a(v) {console.log(v)}}, 'a', 0, 100, 1000, null);

carousel.mountTo(document.body);