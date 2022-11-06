//import * as Canvas from "canvas";
//Canvas.Image;
//global.Image = Canvas.Image;
const { Image } = require('canvas');

import * as jsdom from "jsdom";
const { JSDOM, ResourceLoader } = jsdom;

/* Set the user agent to "nodejs" so graphs can conditionally respond */
const options = new ResourceLoader({
  userAgent: "nodejs"
});
const dom = new JSDOM(`<!DOCTYPE html>`, {resources: options})

global.Image = Image;
const useragent = dom.window.navigator.userAgent;

//window.Image = Image;

global.document = dom.window.document;
import * as litegraph from "litegraph.js";
import WebSocket from 'ws';
import { ExecSocket } from "../types/ExecSocket";
import { createNode, createNodeEx } from "../utils/liteGraphUtils.js"
import { createMultiForgeNodes } from "./multiForgeTools";
import getForges from "../utils/getForge";
import { Forge } from "../types/Forge";
import {
    ForgeTool,
    PositionalValue,
    FlaggedValue,
    OutputValue,
  } from "../types/ForgeTool";
import { JSONResponse } from "../types/JSONResponse";
import { exit } from "process";


//Creates the dynamic nodes that come from ForgeNodes
const create_nodes = async(forgeArray: Forge[]) =>{
    const create_node = async (forge: Forge) => {
        const ret: JSONResponse<ForgeTool[]> = await forge.getDetails();
        ////console.log("I am a forge: " + forge.name);
        ////console.log(`I have tools:`);
        ret?.data?.forEach((tool: ForgeTool) => {
          forgeTools.push(tool);
          const tool_inputs: Map<string, string> = new Map<string, string>();
          const tool_output: Map<string, string> = new Map<string, string>();
          tool.args.forEach(
            (
              value: PositionalValue | FlaggedValue,
              index: number,
              array: (PositionalValue | FlaggedValue)[]
            ) => {
              ////console.log(array[index]);
              ////console.log(value);
              tool_inputs.set(value.name, value.value_type);
            }
          );
          tool_output.set(tool.output.name, tool.output.value_type);
          createNodeEx(forge.name, {
            inputs: Object.fromEntries(tool_inputs),
            outputs: Object.fromEntries(tool_output),
            arg_struct: tool.args,
            forge_id: forge.id,
            title: tool.name,
            url: `${backendURL_WS}/forges/run/${forge.id}/${tool.name}/`,
          });
          console.log("Created node " + forge.name + " tool " + tool.name);
        });
    };

    await Promise.all(forgeArray.map(async (forge) => {
      await create_node(forge);
    }));
}

// Standard variation
function api<T>(url: string): Promise<T> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<T>
    })
}

interface GraphData
{
  _id: string,
   name: string,
   content: string
}

//Get Forges
const { loadForges } = getForges();
const error: string | null = null;
const backendURL = "http://127.0.0.1:8000/api";
const backendURL_WS = "ws://127.0.0.1:8000/api";
const maxRunTime = 40;
let forgeArray: Forge[] = [];
const forgeTools: ForgeTool[] = [];
const graph = new litegraph.LGraph();
const graphName:string = process.argv[2]; //node bin is 0, this script is 1...

//A callback to end the graph
const nodejs_finish = function(out: object): object {
  graph.stop();
  process.stdout.write(Buffer.from(JSON.stringify(out)));
  //return out;
  exit();
};

//We have to do the rest async because there's plenty of await calls in
//the internal workings of all these functions.
(async () => {
  const data: GraphData | null = await api<GraphData | null>(backendURL + "/graphs/by_name/"+graphName+"/");
  //console.log("The graph data was: ");
  //console.log(data);
  if (data != null)
  {
    //Create the static nodes for multiforge
    createMultiForgeNodes(graph, data?._id, useragent, nodejs_finish);

    //Collect the forges array
    const f: JSONResponse<Forge[]> = await loadForges(backendURL+"/forges");
    forgeArray = f.data ? f.data : [];
    //Create the nodes that come from forge function.
    await create_nodes(forgeArray);
    
    //Do I need to check the value of graph.configure before starting?
    //I found this was returning true even when successful. But perhaps
    //true IS successful?
    graph.configure(JSON.parse(data.content));
    console.log("Starting...");
    graph.start();
  }
})();

