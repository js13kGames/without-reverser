// Theme: Reversed
// https://en.wikipedia.org/wiki/Asteroid_mining

let MINI = require('minified');
let _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;

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
        _.eachObj(this.ship.resources, (key, value) => {
            $('#res-' + key).fill(value);
        });

        // The ship
        $('#active-tool').fill(this.ship.active_tool);

        if (this.ship.docked_to instanceof Station) {
            $('#asteroid').hide();
            $('#station').show();
        }

        if (this.ship.docked_to instanceof Asteroid) {
            $('#station').hide();
            $('#asteroid').show();

            $('#time').fill((this.ticks-this.current_asteroid.landed_on) + ' hours');
            $('#asteroid-classification').fill(this.current_asteroid.classification);
        }
    }
}

class Ship {
    constructor(asteroid) {
        this.docked_to = asteroid;
        this.active_tool = 'probe';

        this.equipment = {
            'probe': {'A': 1, 'C': 1, 'S': 1, 'X': 1}
        };
        this.resources = {
            dust: 0,
            stone: 0,
            carbon: 0,
            metal: 0
        }
    }

    mount(tool, props) {
        this.equipment[tool] = props;
        this.active_tool = tool;
    }

    mine() {
        if (this.docked_to instanceof Asteroid) {
            let [type, amount] = this.docked_to.harvest(this);
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
        let amount = ship.equipment[ship.active_tool][this.classification];
        
        console.log(amount);
        return [res_type, amount];
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

    sell(ship, tool) {
        if (_.keys(this.inventory).contains(tool) &&
            !_.keys(ship.equipment).contains(tool))
            ship.mount(tool, this.inventory[tool]);
    }
}

var engine = new Engine();

$(() => {
    setInterval(() => {
        engine.tick();
        engine.update();
    }, 1000);

    $('#btn-mine').onClick(() => {
        engine.ship.mine();
        engine.update();
    });

    $('#btn-to-station').onClick(() => {
        engine.ship.docked_to = engine.station;
        engine.current_asteroid = null;
        engine.update();
    });

    $('#btn-to-asteroid').onClick(() => {
        engine.ship.docked_to = engine.asteroids[0];
        engine.current_asteroid = engine.asteroids[0];
        engine.current_asteroid.landed_on = engine.ticks;
        engine.update();
    });

    _.eachObj(engine.station.inventory, (tool, props) => {
        let buy_button = EE('a', {'@href': '#', '%tool': tool}, 'buy').onClick((e) => {
            let tool = $(e.target).get('%tool');
            engine.station.sell(engine.ship, tool);
        })
        $('#station-inventory').add(EE('li', tool+' ').add(buy_button));
    });
    
    engine.update();
})
