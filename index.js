let active = false;
let start_time = Date.now();
let max_ellapsed_time = 5000; // ms
let ellapsed_time = 0;

function main_click() {
    if (active) {
        ellapsed_time += Date.now() - start_time;
    } else {
        start_time = Date.now()
    }

    active = !active;
}

const timeElem = document.getElementById('time');
setInterval(() => {
    if (!active) return;
    let cur_ellapsed_time = Date.now() - start_time;

    let total_time = cur_ellapsed_time + ellapsed_time;

    timeElem.innerText = (total_time/1000).toFixed(2);

    if (total_time > max_ellapsed_time) {
        active = false;
        timeElem.innerText = 'gg';
        ellapsed_time = 0;
    }
}, 10)