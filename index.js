// Time Utility
const timefn = performance.now.bind(performance);

// Elements
const timeElem = document.getElementById('time');
const gameElem = document.getElementById('game');
const playerCountElem = document.getElementById('player_count');
const playerCountInputElem = document.querySelector('#player_count input');
const playerBlocksElem = document.querySelector('.player-blocks-container');

let game;

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
        if (val === 'setup') {
            set_accent(accent.inactive);
            playerCountElem.style.display = 'block';
            gameElem.style.display = 'none';
        } else {
            playerCountElem.style.display = 'none';
            gameElem.style.display = 'grid';
        }
        if (val === 'game_over') {
            this.active = false;
            set_accent(accent.game_over);
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

    tick(delta_time) {
        this.time += delta_time;
        if (this.time > game.max_time) {
            this.active = false;
            this.state = 'game_over';
            kill_player(this.active_player);
            this.next_player(-1);
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

    next_player(dir = 1) {
        if (this.alive_player_count() <= 1) {
            this.state = 'setup'
            return;
        }
        let idx = this.active_player;
        let count = 0;
        while (true) {
            idx = wrap_index(idx + dir, this.players.length);
            count++;
            if (count > this.players.length) {
                idx = 0;
                console.log('we shouldnt ahve gotten here');
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
    if (game.state === 'game_over') {
        game.state = 'inactive';
    } else if (game.state === 'inactive') {
        game.state = 'active';
    } else {
        if (game && game.clock_ticking()) {
            let delta_time = timefn() - last_time;
            game.tick(delta_time);
            game.next_player();
        }

        game.active = !game.active;
    }
    last_time = timefn()
}

function reset_click(e) {
    e.preventDefault();
    game.state = 'setup'
    set_accent(accent.inactive);
}

function start_game() {
    player_count = parseInt(playerCountInputElem.value);
    game = new BaseGame(player_count);
    game.state = 'inactive'
}

function render_time(time) {
    timeElem.innerText = (time / 1000).toFixed(3);
}

function set_accent(color) {
    document.documentElement.style.setProperty('--accent', color);
}

const accent = {
    game_over: 'hsl(0, 50%, 50%)',
    active: 'hsl(451, 50%, 50%)',
    inactive: 'hsl(451, 20%, 50%)',
}

setInterval(() => {
    if (!game || !game.clock_ticking()) return;
    let delta_time = timefn() - last_time;

    game.tick(delta_time);
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
    elem.addEventListener('touchstart', reset_click)
    elem.addEventListener('click', main_click)
})
