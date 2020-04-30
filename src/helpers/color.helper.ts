import {IColor, IRgbaHex} from "../interfaces";

export class ColorHelper {
    static parseHex(hex: string): IRgbaHex {
        const h: string[] = hex.split('');
        // 4 = #abc, 7 = #a1b2c3, 9 = #d4e5f680
        if (h[0] !== '#' || ![4, 7, 9].includes(hex.length)) {
            throw new Error('Color is not a required hex ' + hex);
        }
        if (hex.length === 4) {
            hex = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;    // #abc -> #aabbcc
        }
        const ahex: string[] = hex.substring(1, hex.length).match(/.{1,2}/g);
        return {r: ahex[0] ?? 'FF', g: ahex[1] ?? 'FF', b: ahex[2] ?? 'FF', a: ahex[3] ?? 'FF'};
    }

    static hexToRGBA(hex: string): string {
        const rgbaHex: IRgbaHex = ColorHelper.parseHex(hex);

        const intR = parseInt(rgbaHex.r, 16);
        const intG = parseInt(rgbaHex.g, 16);
        const intB = parseInt(rgbaHex.b, 16);
        let intA = parseInt(rgbaHex.a, 16) / 255;
        if (intA < 1 && intA > 0) {
            intA = +intA.toFixed(2);
        }
        return `rgba(${intR}, ${intG}, ${intB}, ${intA})`;
    }

    /**
     * Возвращает строку стилей и имя класса
     * Оба значения можно использовать как есть в виде class=`${className}` style=`${colorStyle}`
     * По-умолчанию альфа-канал не используется, поэтому хранится в отдельных переменных
     * @return Всегда возвращает валидный цвет для подстановки
     */
    static hexToColor(colorHex: string, defClassName: string): IColor {
        const rgbaHex: IRgbaHex = ColorHelper.parseHex(colorHex);

        const hex: string = '#' + rgbaHex.r + rgbaHex.g + rgbaHex.b;
        const hexWithAlpha: string = hex + rgbaHex.a;

        const style: string             = colorHex ? `color: ${hex};`           : '';
        const styleWithAlpha: string    = colorHex ? `color: ${hexWithAlpha};`  : '';
        const className: string         = colorHex ? ''                         : defClassName;

        return {hex, hexWithAlpha, style, styleWithAlpha, className, opacity: parseInt(rgbaHex.a, 16) / 255};
    }
}
