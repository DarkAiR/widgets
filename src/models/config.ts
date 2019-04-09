export type Paddings = {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class Config {
    element: HTMLElement = null;                   // Контейнер для виджета
    showAxisX: boolean = false;
    showAxisY: boolean = false;
    margin: Paddings = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
}
