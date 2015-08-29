// Theme: Reversed
// https://en.wikipedia.org/wiki/Asteroid_mining

let MINI = require('minified');
let _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;

class Engine {
    constructor() {
        this.ticks = 0;
        this.current_asteroid = new Asteroid();
        this.station = new Station();
        this.ship = new Ship(this.current_asteroid, this.station);
        this.asteroids = [this.current_asteroid];
    }

    tick() {
        this.ticks++;
    }

    update() {
        // Resources
        _.eachObj(this.ship.resources, (key, value) => {
            $('nav .res-' + key).fill(value);
        });
        $('nav .cbtc').fill(this.ship.cbtc);

        // The ship
        $('#active-tool').fill(this.ship.active_tool);

        if (_.keys(engine.ship.equipment).length > $('#ship-equipment > li').length) {
            $('#ship-equipment').fill();
            _.eachObj(engine.ship.equipment, (tool) => {
                // Add the tool to the DOM inventory and add a mount button
                let mount_button = EE('a', {'@href': '#', '%tool': tool}, 'mount').onClick((e) => {
                    engine.ship.active_tool = tool;
                    engine.update();
                });
                $('#ship-equipment').add(EE('li', tool+' ').add(mount_button));
            });
        }

        if (this.ship.docked_to instanceof Station) {
            $('#asteroid').hide();
            $('#station').show();

            _.eachObj(this.ship.resources, (key, value) => {
                $('#ship-inventory .res-' + key).set('@value', value);
            });
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
    constructor(asteroid, station) {
        this.docked_to = asteroid;
        this.active_tool = 'probe';

        this.equipment = {
            'probe': station.inventory['probe']
        };
        this.resources = {
            dust: 0,
            stone: 0,
            carbon: 0,
            metal: 0
        }
        this.cbtc = 450;
    }

    mount(tool) {
        this.active_tool = tool;
    }

    equip(tool, props) {
        this.equipment[tool] = props;
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
        let amount = ship.equipment[ship.active_tool]['capability'][this.classification];
        return [res_type, amount];
    }
}

class Station {
    constructor() {
        this.inventory = {
            // take probes from the asteroid
            'probe': {
                'price': 10,
                'capability': {'A': 1, 'C': 1, 'S': 1, 'X': 1}
            },

            // mine on surface
            'conveyor': {
                'price': 500,
                'capability': {'A': 2, 'C': 8, 'S': 4, 'X': 1}
            },

            // shaft mining into the asteroid
            'pipe-drill': {
                'price': 3000,
                'capability': {'A': 3, 'C': 15, 'S': 12, 'X': 2}
            },

            // pick up loose grains with magnet, x-class asteroids only
            'magnet': {
                'price': 4500,
                'capability': {'A': 3, 'C': 1, 'S': 1, 'X': 20}
            },

            // melt the matrix
            'vaporizer': {
                'price': 4000,
                'capability': {'A': 4, 'C': 7, 'S': 6, 'X': 5}
            }
        };
        this.market = {
            'dust': 1,
            'stone': 3,
            'carbon': 20,
            'metal': 45
        };
    }

    sell(ship, tool) {
        // Tools can't be buy several times
        if (!_.keys(this.inventory).contains(tool) ||
            _.keys(ship.equipment).contains(tool)) {
            alert('You already own this tool.');
            return;
        }

        let price = this.inventory[tool].price;
        if (price > ship.cbtc) {
            alert('You have not enough cBTC!');
            return;
        }

        ship.equip(tool, this.inventory[tool]);
        ship.cbtc -= price;
    }

    buy(ship, resource, amount) {
        if (ship.resources[resource] < amount) {
            alert('You have not enough resources loaded');
            return;
        }

        let price = this.market[resource];
        ship.cbtc += price*amount;
        ship.resources[resource] -= amount;
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
        let buy_button = EE('a', {'@href': '#', '%tool': tool}, ' buy for '+props.price+' cBTC').onClick((e) => {
            let tool = $(e.target).get('%tool');
            engine.station.sell(engine.ship, tool);
            engine.update();
        })
        $('#station-inventory').add(EE('li', tool).add(buy_button));
    });

    $('#ship-inventory a').onClick((e) => {
        let res = $(e.target).get('%res');
        
        let amount = $('#ship-inventory input[name="sell-res-'+res+'"]').get('value');
        engine.station.buy(engine.ship, res, amount);
        engine.update();
    });
    
    engine.update();
})
