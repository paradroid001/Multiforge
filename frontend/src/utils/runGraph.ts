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
import { resourceLimits } from "worker_threads";


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
      console.log("Created forge");
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

const run_graph = async(graph: litegraph.LGraph, graphContentURL: string, timeout: number, callback: (out: object) => object) => {
    //LiteGraph.debug = true;
    //const graph = new litegraph.LGraph();
    // Consumer - consumer remains the same
  const graphdata = await api<{ _id: string, name: string, content: string }>(graphContentURL)
  .then(({ _id, name, content }) => {
    console.log("THE ID WAS " + _id);
    ////console.log(name);
    ////console.log(content);

    const datajson = JSON.parse(content);
    return datajson;
  })
  .catch(error => {
    /* show error message */
    console.error(error);
  });

  console.log("After all is said and done?");
  return graphdata;
  console.log(graphdata);


  if (graph.configure(graphdata))
    {
      //console.log(datajson);
      console.log(graph.status);
      setTimeout( () => {
        setTimeout( ()=>{
            console.log("Timeout reached");
            //console.log(`${timeout} second timeout of graph`);
            graph.stop();
            ////console.log(graph._nodes_in_order);
            callback({});
        }, timeout * 1000);
        console.log("Starting graph");
        graph.start(100); //100ms?
      }, 1000); //start after one second
    }
  else {
      console.log("Error parsing graph data");
  }
    /*
    (async () => {
      fetch('graphContentURL').then(
        response => {
          if (!response.ok)
          {
            throw new Error(response.statusText);
          }
          else
          {
            const graphContent = response.text;
            const datajson = JSON.parse(graphContent);
            graph.configure (datajson);
            setTimeout( ()=>{
                //console.log(`${timeout} second timeout of graph`);
                graph.stop();
                ////console.log(graph._nodes_in_order);
                callback();
            }, timeout * 1000);
            //console.log("Starting graph");
            graph.start();
          }
        }
      );
    })();
    */
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
//const graphname = process.argv[0]
////console.log(process.argv);
////console.log(graphname);
//exit();
const graphName:string = process.argv[2]; //node bin is 0, this script is 1...
////console.log("Getting Graph Name: " + graphName);

const nodejs_finish = function(out: object): object {
  graph.stop();
  process.stdout.write(Buffer.from(JSON.stringify(out)));
  //return out;
  exit();
};

//const graphData: GraphData | null = get_graph_by_name(backendURL + "/graphs/by_name/"+graphName+"/");


(async () => {
  const data: GraphData | null = await api<GraphData | null>(backendURL + "/graphs/by_name/"+graphName+"/");
  //console.log("The graph data was: ");
  //console.log(data);
  if (data != null)
  {
    createMultiForgeNodes(graph, data?._id, useragent, nodejs_finish);
    const f: JSONResponse<Forge[]> = await loadForges(backendURL+"/forges");
    forgeArray = f.data ? f.data : [];
    //console.log(forgeArray);
    await create_nodes(forgeArray);
    //const graphdata = await run_graph(graph, backendURL + "/graphs/by_name/"+graphName+"/", maxRunTime, nodejs_finish);
    console.log("The graph data is");
    console.log( JSON.parse(data.content) );
    graph.configure(JSON.parse(data.content));
    //if (graph.configure(JSON.parse(data.content)))
    //{
      console.log("Starting...");
      graph.start();
    //}
    //else {
    //  console.log("Error parsing graph content");
    //}
  }
})();

