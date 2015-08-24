import random_number from './helpers';

class Engine {
    constructor() {
        this.ticks = 0;
        this.resources = {
            dust: 0,
            crystals: 0
        }
    }

    tick() {
        this.ticks++;
    }

    update() {
        document.querySelector('#time').innerHTML = this.ticks + ' hours';
        document.querySelector('#res-dust').innerHTML = this.resources.dust;
    }
}

class Player {
    constructor(engine) {
        this.engine = engine;
    }

    mine() {
        console.log('mine');
        this.engine.resources.dust++;
    }
}

class Asteroid {
    mine_resource() {
        console.log(random_number(2, 10));
    }
}

var engine = new Engine();
var player = new Player(engine);
var current_asteroid = new Asteroid();

var bootstrap = function() {
    setInterval(() => {
        engine.tick();
        engine.update();
    }, 1000);

    document.querySelector('#btn-mine').onclick = () => {
        player.mine();   
        engine.update();
    };
};
