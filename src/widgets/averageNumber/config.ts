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
        initAmount: 2,
        canAdd: false,
        settings: [
            {
                name: "color",
                type: "color",
                default: null
            }
        ]
    }
};
