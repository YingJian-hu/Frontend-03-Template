export function createElement(type, attributes, ...children) {
    let element = null;
    if(typeof type === 'string') {
        element = ElementWrapper(type);
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

export class Component {
    setAttribute(name, attribute) {
        this.root.setAttribute(name, attribute);
    }
    appendChild(child) {
        child.mountTo(this.root);
    }
    mountTo(parent) {
        parent.appendChild(this.root);
    }
    render() {
        this.root = this.render();
    }
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