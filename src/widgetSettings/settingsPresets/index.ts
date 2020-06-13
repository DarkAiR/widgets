import {common} from './common';
import {title} from './title';
import {paddings} from './paddings';
import {chartPaddings} from './chartPaddings';
import {fill} from './fill';
import {label} from './label';
import {background} from './background';
import {chartBackground} from "./chartBackground";
import {axisX} from "./axisX";
import {axisY, axisYFunc} from "./axisY";
import {multiAxesX} from "./multiAxesX";
import {multiAxesY} from "./multiAxesY";
import {legend} from "./legend";
import {singleValue} from "./singleValue";

const settingsPresets = {
    common,
    title,
    chartPaddings,
    paddings,
    fill,
    label,
    singleValue,
    background,
    chartBackground,
    axisX,
    axisY,
    multiAxesX,
    multiAxesY,
    legend,

    func: {
        axisY: axisYFunc,
    }
};
export default settingsPresets;
