export class MathHelper {
    static trunc(val: number): number {
        return val < 0 ? Math.ceil(val) : Math.floor(val);
    }

    static roundInterval(max: number, min: number): [number, number] {
        const maxVal = MathHelper.trunc(max);
        const minVal = MathHelper.trunc(min);
        const delta = maxVal - minVal;      // delta >= 0

        // 1,2,3 => 0;   4,5 => 10;   6,7 => 100;   ...
        let rate = (delta + '').length;
        rate = Math.floor(rate / 2) - 1;
        if (rate <= 0) {
            // Если есть дробная часть, тогда на 1 больше или меньше, иначе то же самое число
            return [
                max === maxVal ? maxVal : MathHelper.trunc(maxVal) + 1,
                min === minVal ? minVal : MathHelper.trunc(minVal) - 1
            ];
        } else {
            rate = Math.pow(10, rate);
            return [
                (MathHelper.trunc(maxVal / rate) + 1) * rate,
                (MathHelper.trunc(minVal / rate) - 1) * rate
            ];
        }
    }
}
