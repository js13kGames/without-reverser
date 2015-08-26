class Helper {
    static random_number(min, max) {
        return Math.floor((Math.random() * max) + min);
    }
}

class DOMNode {
    constructor(node) {
        this.node = node;
    }

    node() {
        return this.node;
    }
}

class DOM {
    static s(selector) {
        return new DOMNode(document.querySelector(selector));
    }
}
