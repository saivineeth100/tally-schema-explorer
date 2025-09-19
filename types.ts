export interface TallyPropertyMeta {
  "Is Repeated"?: "Yes" | "No";
  "Datatype"?: string;
  "Object Name"?: string;
}

export interface TallyProperty {
  Name: string;
  IsComplex: boolean;
  Meta: TallyPropertyMeta;
}

export interface TallySchema {
  Name: string;
  Meta: {
    [key: string]: string;
  };
  Properties: {
    [propertyName: string]: TallyProperty;
  };
}

export type SchemaIndex = Record<string, string[]>;

export interface SchemaDiff {
  HasChanges: boolean;
  AddedProperties: Record<string, TallyProperty>;
  DeletedProperties: Record<string, TallyProperty>;
  ModifiedProperties: Record<string, { old: TallyProperty; new: TallyProperty }>;
  AddedMeta: Record<string, string>;
  DeletedMeta: Record<string, string>;
  ModifiedMeta: Record<string, { oldValue: string; newValue: string }>;
  NameChanged?: boolean;
  OldName?: string | null;
  NewName?: string | null;
}

export interface DiffIndex {
  fromVersion: string;
  toVersion: string;
  addedSchemas: string[];
  removedSchemas: string[];
  modifiedSchemas: string[];
}

export interface FunctionParameter {
  "Parameter Type": string;
  "Datatype"?: string;
  "Is Mandatory": "Yes" | "No";
  "Variable Argument": "No" | "Yes";
}

export interface FunctionMeta {
  "Total Parameters": string;
  "Total Mandatory Parameters": string;
  "Category": string;
  "Execution Mode": string;
  "Return Type"?: string;
}

export interface TallyFunction {
  Description: string;
  Parameters: FunctionParameter[];
  Meta: FunctionMeta;
  Name: string;
}

export type FunctionsIndex = Record<string, TallyFunction>;

export interface DefinitionAttributeParameter {
  "Is Constant"?: "No" | "Yes";
  "Is Mandatory": "Yes" | "No";
  "Dimension Expression"?: "No" | "Yes";
  "Parameter Type"?: string;
  "Datatype"?: string;
  "Is List"?: "No" | "Yes";
  "Refers To"?: string;
  "Separator Char"?: string;
  "Keyword Set"?: string;
  "Keywords"?: string;
}

export interface DefinitionAttributeMeta {
  Aliases: string;
  Type: string;
  "Is Discrete"?: "No" | "Yes";
}

export interface DefinitionAttribute {
  Description: string;
  Parameters: DefinitionAttributeParameter[];
  Meta: DefinitionAttributeMeta;
  Name: string;
}

export type DefinitionAttributesIndex = Record<string, DefinitionAttribute>;

export interface ActionParameter {}

export interface ActionMeta {
  Aliases: string;
  "Total Parameters": string;
  "Total Mandatory Parameters": string;
  Category: string;
  Mode: string;
}

export interface TallyAction {
  Description: string;
  Parameters: ActionParameter[];
  Meta: ActionMeta;
  Name: string;
}

// Fix: Renamed ActionCollection to ActionsIndex for consistency and to fix compilation errors.
export type ActionsIndex = Record<string, TallyAction>;