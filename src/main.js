class Engine {
    constructor() {
        this.ticks = 0;
        this.current_asteroid = new Asteroid();
        this.asteroids = [this.current_asteroid];
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
        document.querySelector('#res-crystals').innerHTML = this.resources.crystals;
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
    mine_resource() {
        return ['dust', 'dust', 'dust', 'crystals'][Helper.random_number(0, 4)];
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
};
