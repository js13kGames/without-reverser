// Theme: Reversed

class Engine {
    constructor() {
        this.ticks = 0;
        this.current_asteroid = new Asteroid();
        this.asteroids = [this.current_asteroid];
        this.resources = {
            dust: 0,
            stone: 0,
            carbon: 0,
            metal: 0
        }
    }

    tick() {
        this.ticks++;
    }

    update() {
        document.querySelector('#time').innerHTML = this.ticks + ' hours';
        document.querySelector('#asteroid-classification').innerHTML = this.current_asteroid.classification;

        document.querySelector('#res-dust').innerHTML = this.resources.dust;
        document.querySelector('#res-stone').innerHTML = this.resources.stone;
        document.querySelector('#res-carbon').innerHTML = this.resources.carbon;
        document.querySelector('#res-metal').innerHTML = this.resources.metal;
    }
}

class Player {
    constructor(engine) {
        this.engine = engine;
    }

    mine() {
        let type = this.engine.current_asteroid.mine_resource();
        this.engine.resources[type]++;
    }
}

class Asteroid {
    constructor() {
        // Determine the class
        this.classification = [
            'A', // small, stone, dust, random
            'C', // dark carbon
            'S', // stone
            'X' // metal
        ][Helper.random_number(0, 4)];
    }

    mine_resource() {
        let resources = {
            'A': ['dust', 'dust', 'stone'],
            'C': ['dust', 'carbon', 'carbon', 'carbon'],
            'S': ['dust', 'stone', 'stone'],
            'X': ['metal']
        }[this.classification];
        return resources[Helper.random_number(0, resources.length)];
    }
}

var engine = new Engine();
var player = new Player(engine);

var bootstrap = function() {
    setInterval(() => {
        engine.tick();
        engine.update();
    }, 1000);

    document.querySelector('#btn-mine').onclick = () => {
        player.mine();   
        engine.update();
    };

    engine.update();
};
