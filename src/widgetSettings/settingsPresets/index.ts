import {title} from './title';
import {paddings} from './paddings';
import {chartPaddings} from './chartPaddings';
import {fill} from './fill';
import {label, labelFields} from './label';
import {background} from './background';
import {chartBackground} from "./chartBackground";
import {axisX} from "./axisX";
import {axisY, axisYFunc} from "./axisY";
import {multiAxesX} from "./multiAxesX";
import {multiAxesY} from "./multiAxesY";
import {legend} from "./legend";
import {singleValue} from "./singleValue";
import {chartBorder} from "./chartBorder";
import {dataSourceName} from "./dataSourceName";
import {lineStyle} from "./lineStyle";

const settingsPresets = {
    title,
    chartBorder,
    chartPaddings,
    paddings,
    fill,
    label, labelFields,
    singleValue,
    background,
    chartBackground,
    axisX,
    axisY,
    multiAxesX,
    multiAxesY,
    legend,
    dataSourceName,
    lineStyle,

    func: {
        axisY: axisYFunc,
    }
};
export default settingsPresets;
