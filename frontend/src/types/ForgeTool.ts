export interface PositionalValue {
    name: string,
    value: any | null,
    value_type: string
}
export interface FlaggedValue {
    name: string,
    flag: string,
    value?: any | null,
    value_type: string 
}
export interface OutputValue {
    name: string,
    value_type: string
}
export interface ForgeTool {
    id: string,
    name: string,
    root: string,
    command: string,
    args: [PositionalValue | FlaggedValue],
    output: OutputValue,
    description: string | null | undefined
}
