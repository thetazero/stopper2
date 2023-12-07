const timeElem = document.getElementById('time');

let active = false;
let start_time = Date.now();
let max_ellapsed_time = 5000; // ms
let ellapsed_time = 0;
let game_state = 'inactive';

function main_click(e) {
    e.preventDefault();
    if (game_state === 'game_over') {
        game_state = 'inactive';
        set_accent(accent.inactive);
    } else if (game_state === 'inactive') {
        game_state = 'active';
        set_accent(accent.active);
        start_time = Date.now();
        active = true;
    } else {
        if (active) {
            ellapsed_time += Date.now() - start_time;
            set_display_time(ellapsed_time);
        } else {
            start_time = Date.now()
        }

        active = !active;
    }
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
    let cur_ellapsed_time = Date.now() - start_time;

    let total_time = cur_ellapsed_time + ellapsed_time;

    set_display_time(total_time);

    if (total_time > max_ellapsed_time) {
        active = false;
        set_display_time(0);
        ellapsed_time = 0;
        game_state = 'game_over';
        set_accent(accent.game_over);
    }
}, 1)

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