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

//document = window.document;
//XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//window.XMLHttpRequest = XMLHttpRequest;
import * as litegraph from "litegraph.js";
//console.log("I am running a graph!");
//console.log(litegraph.LGraph);
//Load WebSocket (browsers have this built in)
//import * as websocket from 'websocket'
//const WebSocket = websocket.w3cwebsocket;
import WebSocket from 'ws';
//global.WebSocket = WebSocket;
//Load execsocket
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

//const graph_data = '{"last_node_id":4,"last_link_id":3,"nodes":[{"id":2,"type":"basic/console","pos":[472,120],"size":{"0":140,"1":46},"flags":{},"order":1,"mode":1,"inputs":[{"name":"log","type":-1,"link":3},{"name":"msg","type":0,"link":null}],"properties":{"msg":""}},{"id":4,"type":"events/timer","pos":[236,293],"size":{"0":140,"1":26},"flags":{},"order":0,"mode":0,"outputs":[{"name":"on_tick","type":-1,"links":[3]}],"properties":{"interval":1000,"event":"tick"},"boxcolor":"#222"}],"links":[[3,4,0,2,0,-1]],"groups":[],"config":{},"extra":{},"version":0.4}'
const graph_data = '{"last_node_id":6,"last_link_id":5,"nodes":[{"id":2,"type":"basic/const","pos":[1,73],"size":[180,30],"flags":{},"order":0,"mode":0,"outputs":[{"name":"value","type":"number","links":[1],"label":"100.000"}],"properties":{"value":100}},{"id":3,"type":"basic/const","pos":[18,214],"size":[180,30],"flags":{},"order":1,"mode":0,"outputs":[{"name":"value","type":"number","links":[2],"label":"100.000"}],"properties":{"value":100}},{"id":4,"type":"basic/const","pos":[43,331],"size":[180,30],"flags":{},"order":2,"mode":0,"outputs":[{"name":"value","type":"number","links":[3],"label":"3.000"}],"properties":{"value":3}},{"id":1,"type":"The First Forge/noise_tool","pos":[280,40.133331298828125],"size":{"0":210,"1":122},"flags":{},"order":3,"mode":0,"inputs":[{"name":"width","type":"number","link":1},{"name":"height","type":"number","link":2},{"name":"octaves","type":"number","link":3}],"outputs":[{"name":"output","type":"string","links":[4]}],"properties":{"url":"ws://127.0.0.1:8000/api/forges/run/62c852312c2ce519395ca71f/noise_tool/","debug":true,"useCachedValue":false},"boxcolor":"#345"},{"id":6,"type":"graphics/frame","pos":[869,163.13333129882812],"size":[200,200],"flags":{},"order":5,"mode":0,"inputs":[{"name":"","type":"image,canvas","link":5}],"properties":{}},{"id":5,"type":"Multiforge/B642Img","pos":[610,115.13333129882812],"size":{"0":140,"1":26},"flags":{},"order":4,"mode":0,"inputs":[{"name":"string","type":"string","link":4}],"outputs":[{"name":"image","type":"image","links":[5]}],"properties":{}}],"links":[[1,2,0,1,0,"number"],[2,3,0,1,1,"number"],[3,4,0,1,2,"number"],[4,1,0,5,0,"string"],[5,5,0,6,0,"image,canvas"]],"groups":[],"config":{},"extra":{},"version":0.4}'
//const graph_data = '{"last_node_id":3,"last_link_id":2,"nodes":[{"id":3,"type":"basic/console","pos":[852,133.13333129882812],"size":{"0":140,"1":46},"flags":{},"order":2,"mode":1,"inputs":[{"name":"log","type":-1,"link":2},{"name":"msg","type":0,"link":null}],"properties":{"msg":""}},{"id":2,"type":"events/trigger","pos":[617,113.13333129882812],"size":{"0":140,"1":66},"flags":{},"order":1,"mode":0,"inputs":[{"name":"if","type":0,"link":1}],"outputs":[{"name":"true","type":-1,"links":null},{"name":"change","type":-1,"links":[2]},{"name":"false","type":-1,"links":null}],"properties":{"only_on_change":true}},{"id":1,"type":"The First Forge/Hello World Tool","pos":[293,114.13333129882812],"size":{"0":210,"1":82},"flags":{},"order":0,"mode":0,"outputs":[{"name":"output","type":"string","links":[1]}],"properties":{"url":"ws://127.0.0.1:8000/api/forges/run/62c852312c2ce519395ca71f/Hello World Tool/","debug":true,"useCachedValue":false},"boxcolor":"#345"}],"links":[[1,1,0,2,0,0],[2,2,1,3,0,-1]],"groups":[],"config":{},"extra":{},"version":0.4}'

const create_nodes = async() =>{
    forgeArray.forEach(async (forge: Forge) => {
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
          //console.log("Created node " + forge.name + " tool " + tool.name);
        });
      });
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


const run_graph = (graph: litegraph.LGraph, graphContentURL: string, timeout: number, callback: (out: object) => object) => {
    //LiteGraph.debug = true;
    //const graph = new litegraph.LGraph();
    // Consumer - consumer remains the same
  api<{ _id: string, name: string, content: string }>(graphContentURL)
  .then(({ _id, name, content }) => {
    ////console.log(_id);
    ////console.log(name);
    ////console.log(content);

    const datajson = JSON.parse(content);
    graph.configure(datajson);
    setTimeout( ()=>{
        //console.log(`${timeout} second timeout of graph`);
        graph.stop();
        ////console.log(graph._nodes_in_order);
        callback({});
    }, timeout * 1000);
    //console.log("Starting graph");
    graph.start();

  })
  .catch(error => {
    /* show error message */
    console.error(error);
  });

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

const nodejs_finish = function(out: object): object
{
  graph.stop();
  process.stdout.write(Buffer.from(JSON.stringify(out)));
  //return out;
  exit();
}

createMultiForgeNodes(graph, useragent, nodejs_finish);
(async () => {
  const f: JSONResponse<Forge[]> = await loadForges(backendURL+"/forges");
  forgeArray = f.data ? f.data : [];
  //console.log(forgeArray);
  await create_nodes();
  run_graph(graph, backendURL + "/graphs/by_name/"+graphName+"/", maxRunTime, nodejs_finish);
})();

