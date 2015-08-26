// Theme: Reversed
// https://en.wikipedia.org/wiki/Asteroid_mining

class Engine {
    constructor() {
        this.ticks = 0;
        this.current_asteroid = new Asteroid();
        this.station = new Station();
        this.ship = new Ship(this.current_asteroid);
        this.asteroids = [this.current_asteroid];
    }

    tick() {
        this.ticks++;
    }

    update() {
        // Resources
        DOM.s('#res-dust').node.innerHTML = this.ship.resources.dust;
        DOM.s('#res-stone').node.innerHTML = this.ship.resources.stone;
        DOM.s('#res-carbon').node.innerHTML = this.ship.resources.carbon;
        DOM.s('#res-metal').node.innerHTML = this.ship.resources.metal;

        if (this.ship.docked_to instanceof Station) {
            DOM.s('#asteroid').node.style.display = 'none';
            DOM.s('#station').node.style.display = '';
        }

        if (this.ship.docked_to instanceof Asteroid) {
            DOM.s('#station').node.style.display = 'none';
            DOM.s('#asteroid').node.style.display = '';

            DOM.s('#time').node.innerHTML = (this.ticks-this.current_asteroid.landed_on) + ' hours';
            DOM.s('#asteroid-classification').node.innerHTML = this.current_asteroid.classification;
        }
    }
}

class Ship {
    constructor(asteroid) {
        this.docked_to = asteroid;

        this.equipment = ['probe'];
        this.resources = {
            dust: 0,
            stone: 0,
            carbon: 0,
            metal: 0
        }
    }

    mine() {
        if (this.docked_to instanceof Asteroid) {
            let [type, amount] = this.docked_to.harvest();
            this.resources[type] += amount;
        }
    }
}

class Asteroid {
    constructor() {
        this.landed_on = 0;

        // Determine the class
        this.classification = [
            'A', // small, stone, dust, random
            'C', // dark carbon
            'S', // stone
            'X' // metal
        ][Helper.random_number(0, 4)];
    }

    harvest(ship) {
        let resources = {
            'A': ['dust', 'dust', 'stone'],
            'C': ['dust', 'carbon', 'carbon', 'carbon'],
            'S': ['dust', 'stone', 'stone'],
            'X': ['metal']
        }[this.classification];
        let res_type = resources[Helper.random_number(0, resources.length)];
        // TODO: amount
        return [res_type, 1];
    }
}

class Station {
    constructor() {
        this.inventory = {
            // take probes from the asteroid
            'probe': {'A': 1, 'C': 1, 'S': 1, 'X': 1},

            // mine on surface
            'conveyor': {'A': 2, 'C': 8, 'S': 4, 'X': 1},

            // shaft mining into the asteroid
            'pipe-drill': {'A': 3, 'C': 15, 'S': 12, 'X': 2},

            // pick up loose grains with magnet, x-class asteroids only
            'magnet': {'A': 3, 'C': 1, 'S': 1, 'X': 20},

            // melt the matrix
            'vaporizer': {'A': 4, 'C': 7, 'S': 6, 'X': 5}
        };
    }

    buy(ship, item) {
        if (this.inventory.indexOf(item) !== -1 &&
            ship.equipment.indexOf(item) === -1)
            ship.equipment.push(item);
    }
}

var engine = new Engine();

var bootstrap = function() {
    setInterval(() => {
        engine.tick();
        engine.update();
    }, 1000);

    DOM.s('#btn-mine').node.onclick = () => {
        engine.ship.mine();
        engine.update();
    };

    DOM.s('#btn-to-station').node.onclick = () => {
        engine.ship.docked_to = engine.station;
        engine.current_asteroid = null;
        engine.update();
    }

    DOM.s('#btn-to-asteroid').node.onclick = () => {
        engine.ship.docked_to = engine.asteroids[0];
        engine.current_asteroid = engine.asteroids[0];
        engine.current_asteroid.landed_on = engine.ticks;
        engine.update();
    }
    engine.update();
};
