const timeElem = document.getElementById('time');

let active = false;
let last_time = Date.now();
let game_state = 'inactive';

const max_time = 5000;

const state = {
    _game_state: 'inactive',
    get game_state() {
        return this._game_state;
    },
    set game_state(val) {
        if (val === 'game_over') {
            active = false;
            set_accent(accent.game_over);
        } else if (val === 'active') {
            set_accent(accent.active);
            this.time_remaining = max_time;
            active = true;
        } else if (val === 'inactive') {
            set_accent(accent.inactive);
            active = false;
        }
        this._game_state = val;
    },
    _time_remaining: 0,
    get time_remaining() {
        return this._time_remaining;
    },
    set time_remaining(val) {
        this._time_remaining = val;
        timeElem.innerText = (val / 1000).toFixed(3);
    },
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
            state.time_remaining -= delta_time;
        }

        active = !active;
    }
    last_time = Date.now()
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

    state.time_remaining -= delta_time;
    console.log(state.time_remaining, delta_time)

    if (state.time_remaining < 0) {
        state.time_remaining = -1;
        active = false;
        state.total_time = max_time
        state.game_state = 'game_over';
    }
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

set_accent(accent.inactive);

state.time_remaining = max_time;