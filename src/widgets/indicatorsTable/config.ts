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
        initAmount: 6,
        canAdd: false,
        settings: []
    }
};
