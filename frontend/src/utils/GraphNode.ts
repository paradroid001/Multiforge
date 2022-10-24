export interface GraphNode
{
    log: (message:any) => void;
    isDebug: () => boolean;
}