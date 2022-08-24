import {ExecSocket} from '@/types/ExecSocket';
//import * as litegraph from "litegraph.js";
//import { createNode, createNodeEx } from '@/utils/liteGraphUtils';
import { Forge } from '@/types/Forge';
import { ForgeTool } from '@/types/ForgeTool';
import { LGraphNode, LiteGraph} from "litegraph.js";
//import createNode from "litegraph.js";


class BradTestNode<T> extends LGraphNode
{
  constructor()
  {
    super("Set a custom title");
  }
}

const createExecNode = (menuPath: string, nodeName: string, params: { [index: string]: any}) =>
{
  class BradTestNode2 extends LGraphNode
  {
    constructor()
    {
      super(nodeName);
    }
  }
  function inner_node(this:LGraphNode) //this as first arg means it can be typed.
  {
    type ObjectKey = keyof LGraphNode;

    if (params["inputs"])
    {
      Object.keys(params["inputs"]).forEach(key => this.addInput(key, params["inputs"][key]));
    }
    if (params["outputs"])
    {
      Object.keys(params["outputs"]).forEach(key => this.addInput(key, params["inputs"][key]));
    }

    //For things that aren't inputs/outputs, we'd just have to explicitly
    //set them.
    if (params["title"])
    {
      this.title = params["title"]
    }
    /*
    Object.keys(params).forEach( key => {
      if (key === "title" || key === "inputs" || key === "outputs") return;
      if (typeof params[key] === "function") return;

      const objectKey = key as ObjectKey;
      this[objectKey] = params[key];
    });
    */
    

  }
  
  //const obj = { new: () => {return newnode;} };
  //inner_node.prototype = BradTestNode.prototype;
  //function test(){};
  //test.prototype = BradTestNode2.prototype;
  //BradTestNode2
  LiteGraph.registerNodeType(menuPath, BradTestNode2);
    
  //LiteGraph.registerNodeType(menuPath + "/" + nodeName, inner_node);
  //return node;

    /*
    createNode(`brad/${className}`, {
        title: `${className}`,
        inputs: {
          in1: "number",
          in2: "string",
          in3: "boolean"
        },
        outputs: {
          out1: "string",
          out2: "bool",
          out3: "number"
        },
        onExecute() {
          const something = this.getInputData(0);
          if (!something) return;
  
          
          //this.setOutputData(0, canvas);
          //this.setOutputData(1, context);
          //this.setOutputData(2, delta);
        }
      });
      */
    
};


class ExecNode extends LGraphNode
{
    
}

/*

const createNoderino = (type: string, params) => {
  const { inputs, outputs } = params;

  function node(this:LGraphNode) {
    if (inputs) {
      Object.keys(inputs).forEach(key => this.addInput(key, inputs[key]));
    }

    if (outputs) {
      Object.keys(outputs).forEach(key => this.addOutput(key, outputs[key]));
    }

    Object.keys(params).forEach(key => {
      if (key === 'title' || key === 'inputs' || key === 'outputs') return;
      if (typeof params[key] === 'function') return;

      this[key] = params[key];
    });
  }

  Object.keys(params).forEach(key => {
    if (key === 'title' || key === 'inputs' || key === 'outputs') return;

    if (typeof params[key] === 'function') {
      node.prototype[key] = params[key];
    }
  });

  if (params.title) {
    node.title = params.title;
  }

  LiteGraph.registerNodeType(type, node);
  return node;
};

*/

export { createExecNode, ExecNode };


