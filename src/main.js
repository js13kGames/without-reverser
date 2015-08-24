class Engine {
    constructor() {
        this.ticks = 0;
        this.resources = {
            dust: 0
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
