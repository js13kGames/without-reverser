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
        this.game_running = true;
        this.init_sequence_run = true;
    }

    tick() {
        this.ticks++;
    }

    update() {
        // Endgame?
        if (!this.game_running) {
            $('#ship, #asteroid, #station, #startgame').hide();
            $('#endgame').show();
            return;
        }

        if (this.init_sequence_run) {
            $('#ship, #asteroid, #station, #endgame').hide();
            $('#startgame').show();
            return;
        }

        // Resources
        _.eachObj(this.ship.resources, (key, value) => {
            $('nav .res-' + key).fill(value);
        });
        $('nav .cbtc').fill(this.ship.cbtc);

        // The ship
        $('#active-tool').fill(this.ship.active_tool);

        if (_.keys(engine.ship.equipment).length != $('#ship-equipment > li').length) {
            $('#ship-equipment').fill();
            _.eachObj(engine.ship.equipment, (item) => {
                // Skip if it is not a tool to mount
                let type = this.ship.equipment[item]['type'];

                // Tools can mount on the ship
                if (type == 'tool') {
                    // Add the tool to the DOM inventory and add a mount button
                    let mount_button = EE('a', {'@href': '#', '%tool': item}, 'mount').onClick((e) => {
                        engine.ship.active_tool = item;
                        engine.update();
                    });
                    $('#ship-equipment').add(EE('li', item+' ').add(mount_button));
                }

                // Bots can deploy on an asteroid
                if (type == 'bot') {
                    let deploy_button = EE('a', {'@href': '#'}, 'deploy').onClick((e) => {
                        // This only works on asteroids
                        if (engine.ship.docked_to instanceof Asteroid) {
                            let bot = new Bot(item, engine.ship.equipment[item]['capability']);
                            engine.ship.docked_to.deploy_bot(bot);
                            delete engine.ship.equipment[item];
                            engine.update();
                        } else {
                            alert('You need to land on an asteroid first.');
                        }
                    });
                    $('#ship-equipment').add(EE('li', item+' ').add(deploy_button));
                }
            });
        }

        if (this.ship.docked_to instanceof Station) {
            $('#asteroid').hide();
            $('#station').show();
        }

        if (this.ship.docked_to instanceof Asteroid) {
            $('#station').hide();
            $('#asteroid').show();

            $('#time').fill((this.ticks-this.current_asteroid.landed_on) + ' hours');
            $('#asteroid-classification').fill(this.current_asteroid.classification);

            $('#bots').fill();
            _.eachObj(this.current_asteroid.bots, (i, bot) => {
                let destroy_button = EE('a', {'@href': '#'}, 'destroy').onClick((e) => {
                    bot.docked_to.bots.splice(i, 1);
                    engine.update();
                });
                $('#bots').add(EE('li', bot.model+' ').add(destroy_button));
            });
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
        this.upgrades = {
            
        };
        this.resources = {
            dust: 0,
            stone: 0,
            carbon: 0,
            metal: 0
        };
        this.cbtc = 999999999; //450;
    }

    mount(tool) {
        this.active_tool = tool;
    }

    equip(tool, props) {
        this.equipment[tool] = props;
    }

    mine() {
        if (this.docked_to instanceof Asteroid) {
            let [type, amount] = this.docked_to.harvest(this.equipment[this.active_tool]);
            this.resources[type] += amount;
        }
    }
}

class Bot {
    constructor(model) {
        this.model = model;
        this.tool = {'name': 'probe', 'capability': engine.station.inventory['probe'] };
        this.docked_to = false;
    }

    // TODO: Build a gui for this
    mount(tool, props) {
        this.tool = {'name': tool, 'capability': props};
    }

    mine() {
        if (this.docked_to instanceof Asteroid &&
            engine.ship.docked_to == this.docked_to) {
            let [type, amount] = this.docked_to.harvest(this.tool['capability']);
            engine.ship.resources[type] += amount;
        }
    }
}

class Asteroid {
    constructor() {
        this.landed_on = 0;
        this.bots = [];

        // Determine the class
        this.classification = [
            'A', // small, stone, dust, random
            'C', // dark carbon
            'S', // stone
            'X' // metal
        ][Helper.random_number(0, 4)];
    }

    harvest(tool) {
        let resources = {
            'A': ['dust', 'dust', 'stone'],
            'C': ['dust', 'carbon', 'carbon', 'carbon'],
            'S': ['dust', 'stone', 'stone'],
            'X': ['metal']
        }[this.classification];
        let res_type = resources[Helper.random_number(0, resources.length)];
        let amount = tool['capability'][this.classification];
        return [res_type, amount];
    }

    deploy_bot(bot) {
        bot.docked_to = this;
        this.bots.push(bot);
    }
}

class Station {
    constructor() {
        this.inventory = {
            // take probes from the asteroid
            'probe': {
                'price': 10,
                'type': 'tool',
                'capability': {'A': 1, 'C': 1, 'S': 1, 'X': 1}
            },

            // mine on surface
            'conveyor': {
                'price': 500,
                'type': 'tool',
                'capability': {'A': 2, 'C': 8, 'S': 4, 'X': 1}
            },

            // shaft mining into the asteroid
            'pipe-drill': {
                'price': 3000,
                'type': 'tool',
                'capability': {'A': 3, 'C': 15, 'S': 12, 'X': 2}
            },

            // pick up loose grains with magnet, x-class asteroids only
            'magnet': {
                'price': 4500,
                'type': 'tool',
                'capability': {'A': 3, 'C': 1, 'S': 1, 'X': 20}
            },

            // melt the matrix
            'vaporizer': {
                'price': 4000,
                'type': 'tool',
                'capability': {'A': 4, 'C': 7, 'S': 6, 'X': 5}
            },

            'mining-bot': {
                'price': 20000,
                'type': 'bot',
                'capability': {'A': 8, 'C': 8, 'S': 8, 'X': 8}
            },

            'reverser': {
                'price': 90000,
                'type': 'part',
                'capability': {}
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
        // Tools can't be buy multiple times
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

        // Endgame?
        if (tool == 'reverser')
            engine.game_running = false;


        ship.equip(tool, this.inventory[tool]);
        ship.cbtc -= price;
    }

    buy(ship, resource, amount) {
        if (ship.resources[resource] < amount || amount < 0) {
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
    $('#btn-mine').onClick(() => {
        engine.ship.mine();
        engine.update();
    });

    $('#btn-to-station').onClick(() => {
        engine.ship.docked_to = engine.station;
        engine.current_asteroid = null;

        // Update the resources to sell. If the ship is docked to a station,
        // the resources do not change because we can't mine.
        _.eachObj(engine.ship.resources, (key, value) => {
            $('#ship-inventory .res-' + key).set('value', value);
        });

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
        
        let input = $('#ship-inventory input[name="sell-res-'+res+'"]');
        let amount = input.get('value');
        let rest = engine.ship.resources[res] - amount;
        if (rest < 0) rest = engine.ship.resources[res];
        input.set('value', rest);
        engine.station.buy(engine.ship, res, amount);
        engine.update();
    });

    $('#startgame button').onClick((e) => {
        $('#startgame').hide();
        $('#ship').show();

        engine.init_sequence_run = false;
        engine.update();

        setInterval(() => {
            engine.tick();
            _.each(engine.asteroids, (asteroid) => {
                _.each(asteroid.bots, (bot) => {
                    bot.mine();
                })
                    });
            engine.update();
        }, 1000);

    });
    
    engine.update();
})
