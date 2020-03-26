import {IWidgetConfigurationDescription} from "../../interfaces";

export const config: IWidgetConfigurationDescription = {
    settings: [
        {
            name: "title",
            type: "string",
            default: ""
        }
    ],
    dataSet: {
        initAmount: 1,
        canAdd: true,
        settings: [
            {
                name: "color",
                type: "color",
                default: null
            },
            {
                name: "yAxis",
                type: "axis",
                default: "left"
            }
        ]
    }
};
