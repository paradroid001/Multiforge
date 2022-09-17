export interface ForgeTool {
    id: string,
    name: string,
    root: string,
    command: string,
    args: [string],
    description: string | null | undefined
}
