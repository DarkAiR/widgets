import {Widget1} from '../../lib/widget1';

const config = {
    element: document.getElementById('widget'),
    showAxisX: false,
    showAxisY: false,
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
}

const html = (new Widget1()).run(config);
document.getElementById('widget').innerHTML = html;
