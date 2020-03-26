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
                name: "dimensionsNames",
                type: "nameValue",
                default: []
            },
            {
                name: "metricNames",
                type: "nameValue",
                default: []
            }
        ]
    }
};
