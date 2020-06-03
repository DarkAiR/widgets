export class DateHelper {
    static getDaysInYear(date: Date): number {
        return [...new Array(12)]
            .map((v: never, month: number) => new Date(date.getFullYear(), month + 1, 0).getDate())
            .reduce((daysInYear: number, daysInMonth: number) => daysInYear + daysInMonth, 0);
    }

    static getDaysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    static yyyymmdd(date: Date): string {
        return date.getFullYear() + '-' + ['0' + (date.getMonth() + 1), '0' + date.getDate()].map((vv: string) => vv.slice(-2)).join('-');
    }

    /**
     * Правильная конвертация в ISO, с учетом TimeZone
     */
    static toISOString(date: Date): string {
        const pad = function (num: number): string {
            const norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes());
    }

    static addDate(date: Date, year: number, month: number, day: number): Date {
        return new Date(date.getFullYear() + year, date.getMonth() + month, date.getDate() + day, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    }
}
