//import websocket;
import GraphNode from "./GraphNode";
type GraphNode = typeof GraphNode

export class ExecSocket
{
    graphNode: GraphNode;
    configid: number;
    finishCallback: (result: string) => any;
    toolDetails: Record<string, unknown>;
    socket!: WebSocket;

    constructor(graphNode: GraphNode)
    {
        this.graphNode = graphNode;
        this.configid = 0;
        this.finishCallback = this.defaultFinishCallback;
        this.toolDetails = {};
    }

    defaultFinishCallback(result: string)
    {
        this.graphNode.log(result);
    }

    start(url: string)
    {
        this.socket = new WebSocket(url);
        const myself = this; //store 'this' so callbacks don't get confused.
        this.socket.onclose = function(e)
        {
            myself.onClosed(e);
        }
        this.socket.onmessage = function(e)
        {
            myself.onMessage(e.data);
        }
        this.socket.onopen = function(e)
        {
            myself.onOpened(e);
        }
        this.socket.onerror = function(e)
        {
            myself.onError(e);
        }
        return this.socket;
    }

    send(data:any)
    {
        this.graphNode.log("in send, data:");
        this.graphNode.log(data);
        this.graphNode.log("sending: " + JSON.stringify(data));
        this.socket.send(JSON.stringify(data));
    }

    setFinishCallback(callback: any)
    {
        this.finishCallback = callback;
    }
    setToolDetails(forge_id:string, tool_name:string, argdata:any)
    {
        this.toolDetails.forgeID = forge_id;
        this.toolDetails.toolName = tool_name;
        this.toolDetails.argData = argdata;
    }

    onMessage(textdata: string)
    {
        this.graphNode.log("Exec socket recieved data: " + textdata);
        const data = JSON.parse(textdata);
        switch (data.messagetype)
        {
            case "initok":
                {
                    this.graphNode.log('initok');
                    const senddata:any = {};
                    senddata['messagetype'] = 'indata';
                    senddata['data'] = this.toolDetails.toolArgs;
                    this.send(senddata);
                    break;
                }
            case 'outdata':
                {
                    this.graphNode.log('recieved data ' + data['data']);
                    this.finishCallback( JSON.stringify(data['data']) );
                        //JSON.stringify({status: 'OK', output: data['data']}));
                    break;
                }
            case 'error':
                this.graphNode.log('Errors not yet supported');
                break;
        }
    }

    onClosed(e)
    {
        this.graphNode.log("Exec socket closed " + e);
    }
    onOpened(e)
    {
        this.graphNode.log("Exec socket opened " + e);

        const message:any = {}
        message['messagetype'] = 'init';
        message['data'] =  { "forgeID": this.toolDetails.forgeID, 
                             "toolName": this.toolDetails.toolName
                            };
        
        this.send(message);
    }
    onError(e)
    {
        this.graphNode.log("Exec socket error: " + e);
    }
}