import {IRgbaHex} from "../interfaces";

export class ColorHelper {
    static parseHex(hex: string): IRgbaHex {
        if (hex.split('')[0] !== '#' || hex.length < 7) {
            throw new Error('Color is not a required hex ' + hex);
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
}
