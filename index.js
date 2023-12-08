const timeElem = document.getElementById('time');
const gameElem = document.getElementById('game');
const playerCountElem = document.getElementById('player_count');
const playerCountInputElem = document.querySelector('#player_count input');
const playerBlocksElem = document.querySelector('.player-blocks-container');

let active = false;
let last_time = Date.now();
let game_state = 'setup';

const max_time = 5000;

const state = {
    _game_state: 'inactive',
    get game_state() {
        return this._game_state;
    },
    set game_state(val) {
        if (val === 'setup') {
            playerCountElem.style.display = 'block';
            gameElem.style.display = 'none';
        } else {
            playerCountElem.style.display = 'none';
            gameElem.style.display = 'grid';
        }
        if (val === 'game_over') {
            active = false;
            set_accent(accent.game_over);
        } else if (val === 'active') {
            set_accent(accent.active);
            this.time = 0;
            active = true;
        } else if (val === 'inactive') {
            set_accent(accent.inactive);
            active = false;
        }
        this._game_state = val;
    },
    _time: 0,
    get time() {
        return this._time;
    },
    set time(val) {
        if (val > max_time) {
            val = max_time + 1;
            active = false;
            state.total_time = max_time
            state.game_state = 'game_over';
            kill_player(state.active_player);
            next_player();
        }
        this._time = val;
        timeElem.innerText = (val / 1000).toFixed(3);
    },
    _players: [],
    get players() {
        return this._players;
    },
    get player_count() {
        return this._players.length;
    },
    set player_count(val) {
        this._players = new Array(val).fill(true)
        console.log(this._players)
        render_player_count(val);
        set_active_player(0);
    },
    _active_player: 0,
    get active_player() {
        return this._active_player;
    },
    set active_player(val) {
        this._active_player = val;
        set_active_player(val);
    }
}

function set_active_player(idx) {
    state._active_player = idx;
    playerBlocks.forEach((block, i) => {
        if (i === idx) {
            block.classList.add('active');
        } else {
            block.classList.remove('active');
        }
    })
}

function kill_player(idx) {
    state._players[idx] = false;
    playerBlocks[idx].classList.remove('alive');
    playerBlocks[idx].classList.add('dead');
}

function next_player() {
    console.log('next player')
    let idx = state.active_player;
    while (true) {
        idx++;
        console.log(idx);
        if (idx >= state.player_count) {
            idx = 0;
        }
        if (state.players[idx]) {
            break;
        }
    }
    console.log(idx);
    state.active_player = idx;
}

let playerBlocks = [];
function render_player_count(count) {
    playerBlocksElem.innerHTML = '';
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
    if (state.game_state === 'game_over') {
        state.game_state = 'inactive';
    } else if (state.game_state === 'inactive') {
        state.game_state = 'active';
    } else {
        if (active) {
            let delta_time = Date.now() - last_time;
            state.time += delta_time;
            next_player();
        }

        active = !active;
    }
    last_time = Date.now()
}

function reset_click(e) {
    e.preventDefault();
    game_state = 'inactive';
    set_accent(accent.inactive);
    active = false
    ellapsed_time = 0;
    set_display_time(ellapsed_time);
}

function start_game() {
    state.game_state = 'inactive';
    state.player_count = parseInt(playerCountInputElem.value);
}

function set_display_time(time) {
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
    if (!active) return;
    let delta_time = Date.now() - last_time;

    state.time += delta_time;
    last_time = Date.now();
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
})

document.querySelectorAll('.reset_click').forEach(elem => {
    elem.addEventListener('touchstart', reset_click)
})

set_accent(accent.inactive);
state.time = 0;
