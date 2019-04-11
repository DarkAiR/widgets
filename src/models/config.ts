import {Paddings} from "./types";

export class Config {
    element: HTMLElement = null;                   // Контейнер для виджета
    showAxisX: boolean = false;
    showAxisY: boolean = false;
    padding: Paddings = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };
    margin: Paddings = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
}
