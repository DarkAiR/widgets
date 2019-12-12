import s from '../../styles/_all.less';
import w from './searchBar.less';
import {EventBusEvent} from 'goodteditor-event-bus';

import {
    IChartData,
    INameValue,
    IWidgetVariables,
} from '../../interfaces';

import {SearchBarSettings} from './searchBarSettings';

import {
    get as _get, set as _set,
    defaultTo as _defaultTo
} from 'lodash';

import {Chart} from '../../models/Chart';

export class SearchBar extends Chart {
    getVariables(): IWidgetVariables {
        return {};
    }

    run(data: IChartData): void {
        const settings = <SearchBarSettings>data.settings;

        this.listen(this.onEventBus.bind(this));

        this.config.element.innerHTML = '';

        this.resize(this.config.element, (width, height) => {
        });
    }

    private onEventBus(ev: EventBusEvent, eventData: INameValue): void {
        const res = /(.*?)(?: (\d*))?$/.exec(eventData.name);
        const varName: string = _defaultTo(_get(res, '1'), '');
        const varId: number = _defaultTo(_get(res, '2'), 0);

        const setVar = (id, prop, val) => {
            _set(this.config.template.dataSets[varId], prop, val);
            this.reload();
        };
        switch (varName) {
            // TODO
        }
    }
}
