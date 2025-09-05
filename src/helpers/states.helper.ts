import {ISettings} from "../interfaces";

export class StatesHelper {
    private static stack: {[key: string]: ISettings[]} = {};

    static clear(): void {
        StatesHelper.stack = {};
    }

    static push(changes: ISettings, idx: string | number = 0): void {
        if (StatesHelper.stack[idx] === undefined) {
            StatesHelper.stack[idx] = [];
        }
        StatesHelper.stack[idx].push(changes);
    }

    /**
     * Get last changes and exclude it
     */
    static getLastChanges<T = ISettings>(idx: string | number = 0): T {
        if (StatesHelper.stack[idx] !== undefined) {
            if (StatesHelper.stack[idx].length) {
                return StatesHelper.stack[idx].splice(-1)[0] as T;
            }
        }
        return {} as T;
    }

    /**
     * Get first changes and leave it
     */
    static getFirstChanges(idx: string | number = 0): ISettings {
        if (StatesHelper.stack[idx] !== undefined) {
            if (StatesHelper.stack[idx].length) {
                return StatesHelper.stack[idx][0];
            }
        }
        return {};
    }

    static isEmpty(idx: string | number = 0): boolean {
        if (StatesHelper.stack[idx] === undefined) {
            return true;
        }
        return StatesHelper.stack[idx].length === 0;
    }
}
