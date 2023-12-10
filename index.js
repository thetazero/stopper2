// Time Utility
const timefn = performance.now.bind(performance);

// Elements
const timeElem = document.getElementById('time');
const gameElem = document.getElementById('game');
const playerCountElem = document.getElementById('player_count');
const playerCountInputElem = document.querySelector('#player_count input');
const playerBlocksElem = document.querySelector('.player-blocks-container');

const winScreenElem = document.getElementById('win');
const winnerNameElem = document.getElementById('winner-name');

let game;

class ScreenManager {
    constructor(screen) {
        this._screenElems = {
            'setup': playerCountElem,
            'game': gameElem,
            'win': winScreenElem,
        }
        this._callbacks = {
            'setup': () => {
                game = null;
            },
            'game': this.switch_to_game.bind(this),
            'win': ({ winner }) => {
                winnerNameElem.innerText = winner + 1;
                game = null;
            },
        }
        this.change_screen(screen);
        this.game_settings = null;
    }

    change_screen(new_screen, args) {
        for (let key in this._screenElems) {
            this._screenElems[key].style.display = 'none';
        }
        if (this._screenElems[new_screen]) {
            this._screenElems[new_screen].style.display = 'block';
            if (args) {
                this._callbacks[new_screen](args);
            } else {
                this._callbacks[new_screen]();
            }
        } else {
            console.log(`Screen ${new_screen} does not exist`);
        }
        this.screen = new_screen;
    }

    restart_game() {
        if (this.game_settings) {
            this.change_screen('game', this.game_settings);
        } else {
            this.change_screen('setup');
        }
    }

    switch_to_game(player_count) {
        game = new BaseGame(player_count);
        game.state = 'inactive'
        this.game_settings = player_count;
    }

}

class BaseGame {
    constructor(playerCount) {
        this._state = 'setup';
        this._time = 0;
        this._players = new Array(playerCount).fill(true);
        render_player_count(playerCount);

        this._active_player = 0;
        this.active_player = 0;

        this.last_time = timefn();
        this.active = false;
        this.max_time = 5000;
    }

    get state() {
        return this._state;
    }

    set state(val) {
        if (val === 'dead') {
            this.active = false;
            set_accent(accent.red);
        } else if (val === 'active') {
            set_accent(accent.active);
            this.time = 0;
            this.active = true;
        } else if (val === 'inactive') {
            set_accent(accent.inactive);
            this.time = 0;
            this.active = false;
        }
        this._state = val;
    }

    tick(delta_time, click) {
        this.time += delta_time;
        if (this.time > game.max_time && click) {
            kill_player(this.active_player);

            if (this.alive_player_count() <= 1) {
                let winner = this.get_first_alive_player();
                screenManager.change_screen('win', { winner });
                return;
            }

            this.active = false;
            this.state = 'dead';
            this.next_player(-1);
        } else if (click){
            this.next_player();
        }
    }

    get time() {
        return this._time;
    }

    set time(val) {
        this._time = val;
        render_time(val);
    }

    get players() {
        return this._players;
    }

    get active_player() {
        return this._active_player;
    }

    set active_player(idx) {
        this._active_player = idx;
        playerBlocks.forEach((block, i) => {
            if (i === idx) {
                block.classList.add('active');
            } else {
                block.classList.remove('active');
            }
        })
    }

    alive_player_count() {
        return count_alive_players(this._players);
    }

    get_first_alive_player() {
        let idx = null;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i]) {
                idx = i;
                break;
            }
        }
        return idx;
    }

    next_player(dir = 1) {
        let idx = this.active_player;
        let count = 0;
        while (true) {
            idx = wrap_index(idx + dir, this.players.length);
            count++;
            if (count > this.players.length) {
                idx = 0;
                console.log('we shouldnt have gotten here');
                break;
            }
            if (game.players[idx]) {
                break;
            }
        }
        game.active_player = idx;
    }

    clock_ticking() {
        return game.active && (game.state == 'active');
    }
}

function wrap_index(i, n) {
    return ((i % n) + n) % n
}

function count_alive_players(players) {
    return players.filter(p => p).length;
}

function kill_player(idx) {
    game._players[idx] = false;
    playerBlocks[idx].classList.remove('alive');
    playerBlocks[idx].classList.add('dead');
}

let playerBlocks = [];
function render_player_count(count) {
    playerBlocksElem.innerHTML = '';
    playerBlocks = [];
    for (let i = 0; i < count; i++) {
        let block = document.createElement('div');
        block.classList.add('player-block');
        block.classList.add('alive');
        block.innerText = i + 1;
        playerBlocksElem.appendChild(block);
        playerBlocks.push(block);
    }
}

function main_click(e) {
    e.preventDefault();
    if (game.state === 'dead') {
        game.state = 'inactive';
    } else if (game.state === 'inactive') {
        game.state = 'active';
    } else {
        if (game && game.clock_ticking()) {
            let delta_time = timefn() - last_time;
            game.tick(delta_time, true);
        }

        game.active = !game.active;
    }
    last_time = timefn()
}

function setup_game() {
    screenManager.change_screen('setup');
}

function start_game() {
    player_count = parseInt(playerCountInputElem.value);
    screenManager.change_screen('game', player_count);
}

function restart_game() {
    screenManager.restart_game();
}

function render_time(time) {
    timeElem.innerText = (time / 1000).toFixed(3);
}

function set_accent(color) {
    document.documentElement.style.setProperty('--accent', color);
}

const accent = {
    red: 'hsl(0, 50%, 50%)',
    active: 'hsl(451, 50%, 50%)',
    inactive: 'hsl(451, 20%, 50%)',
}

setInterval(() => {
    if (!game || !game.clock_ticking()) return;
    let delta_time = timefn() - last_time;

    game.tick(delta_time, false);
    last_time = timefn();
}, 5)

window.addEventListener('resize', () => {
    fix_window_sizing()
});

function fix_window_sizing() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fix_window_sizing()

document.querySelectorAll('.main_click').forEach(elem => {
    elem.addEventListener('touchstart', main_click)
    elem.addEventListener('click', main_click)
})

document.querySelectorAll('.reset_click').forEach(elem => {
    elem.addEventListener('touchstart', setup_game)
    elem.addEventListener('click', setup_game)
})

const screenManager = new ScreenManager('setup');
