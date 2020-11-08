import { Timeline, Animation } from './animation.js';
import { ease, easeIn } from './ease.js';

let timeline = new Timeline();

let animation = new Animation(document.querySelector('#el').style, 'transform', 0, 500, 1000, 0, easeIn, v => `translateX(${v}px)`);

timeline.add(animation);

timeline.start();

document.querySelector('#pause-btn').addEventListener('click', () => timeline.pause(animation));

document.querySelector('#resume-btn').addEventListener('click', () => timeline.resume(animation));

