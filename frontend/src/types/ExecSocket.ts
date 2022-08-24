//import websocket;

export class ExecSocket
{
    configid: number;
    finishCallback: (result: string) => any;
    toolArgs: Record<string, unknown>;
    socket!: WebSocket;

    constructor()
    {
        this.configid = 0;
        this.finishCallback = this.defaultFinishCallback;
        this.toolArgs = {};
        //this.socket = new WebSocket("http://localhost:8000");

    }

    defaultFinishCallback(result: string)
    {
        console.log(result);
    }

    start(url: string)
    {
        this.socket = new WebSocket("ws://" + url);
    }
}