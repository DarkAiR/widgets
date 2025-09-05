import dayjs, {Dayjs} from 'dayjs';
require('dayjs/locale/ru');

export class DateHelper {
    static months: string[] = null;

    static getDaysInYear(date: Date): number {
        return [...new Array(12)]
            .map((v: never, month: number) => new Date(date.getFullYear(), month + 1, 0).getDate())
            .reduce((daysInYear: number, daysInMonth: number) => daysInYear + daysInMonth, 0);
    }

    static getDaysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    static yyyymmdd(dateIn?: Dayjs): string {
        if (!dateIn) {
            dateIn = dayjs();
        }
        return dateIn.format('YYYY-MM-DD');
    }

    static ddmmyyyy(dateIn?: Dayjs): string {
        if (!dateIn) {
            dateIn = dayjs();
        }
        return dateIn.format('DD.MM.YYYY');
    }

    static time(dateIn?: Dayjs, useSeconds: boolean = true): string {
        if (!dateIn) {
            dateIn = dayjs();
        }
        return dateIn.format(useSeconds ? 'hh:mm:ss' : 'hh:mm');
    }

    /**
     * Конвертация в усеченный ISO, с учетом TimeZone
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

    static getMonthsAbbr(): string[] {
        if (DateHelper.months === null) {
            DateHelper.months = [...new Array(12)].map((v: unknown, i: number) => {
                let month: string = dayjs().locale('ru').set('month', i).format('MMM');

                // firstLetterUppercase
                month = month.charAt(0).toUpperCase() + month.substring(1, month.length);

                // rtrim('.')
                const arr: string[] = [...month];
                if (arr[arr.length - 1] === '.') {
                    arr.pop();
                }
                return arr.join('');
            });
        }
        return DateHelper.months;
    }
}
