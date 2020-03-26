import {IWidgetConfigurationDescription} from "../../interfaces";

export const config: IWidgetConfigurationDescription = {
    settings: [
        {
            name: "title",
            type: "string",
            default: ""
        },
        {
            name: "icon",
            type: "string",
            default: ""
        }
    ],
    dataSet: {
        initAmount: 2,
        canAdd: false,
        settings: []
    }
};
