
export const enum applicableFor {
    Both = "Both",
    IP = "IP",
    CP = "CP"
}

export const enum usedIn {
    Both = "Both",
    Print = "Print",
    Reprint = "Reprint"
}

export const enum InputTypes {
    Text = "Text",
    Dropdown = "Dropdown"
}

export const enum InputPrintType {
    System = "System",
    Meta = "Meta",
    Input = "Input",
    None = "None"
}

export const enum InputValidations {
    Required = "Required",
    MinLength = "MinLength",
    MaxLength = "MaxLength",
    Pattern = "Pattern"
}

export class InputSelectOption {
    public label: string;
    public value: string;
}


export class ProfileTemplate {
    public _id: string;
    public name: string;
    public url: string;
    public isDeleted: boolean;
    public index: number;
    public file: File;
    public fields: {
        key: string,
        value: string | null;
    }[];
}

export class InputFiled {
    public name: string;
    public type: InputTypes;
    public validation: InputValidations[];
    public selectOptions: InputSelectOption[];
    public printType: InputPrintType;
    public key: string;
    public value: string;
    public show: boolean;
    public templateId: string;
}

export class ProfileDocument {
    public id: string;
    public typeId: string;
    public name: string;
    public description: string;
}
export class ProfileDocumentMapping {
    public _id: string;
    public profileId: string;
    public profileName: string;
    public documents: Set<ProfileDocument>;
    public profile: Profile;
}

export class Profile {
    public _id: string;
    public name: string;
    public applicableFor: applicableFor;
    public usedIn: usedIn;
    public templates: ProfileTemplate[];
    public userInputFields: InputFiled[];
    public isBatchNumberApplicable: boolean;
    public isDeleted: boolean;
}