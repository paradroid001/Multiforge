import * as litegraph from "litegraph.js";
import {ExecSocket} from '@/types/ExecSocket';

const createNode = (type, params) => {
    const { inputs, outputs } = params;
  
    function node() {
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
  
    litegraph.LiteGraph.registerNodeType(type, node);
    return node;
  };

  const createNodeEx = (path, params) =>{

    const { inputs, outputs } = params;
  
    function node() {
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

      this.execsocket = new ExecSocket();
      this.data = "" //data that has come from running the tool
      this.dirty = true; //do we have new data?
      this.running = false; //are we currently running?
      this.addProperty("url", "http://127.0.0.1:9999/unknownyouneedtosetthis");
      this.addProperty("shellurl", "http://127.0.0.1:9998/aurlforashell");
      this.addProperty("execurl", document.location.host + "/some exec url");
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
    if (params.desc) {
      node.desc = params.desc;
    }

    node.prototype.onExecute = function(){
      console.log("Hello world");
      this.execsocket.start("http://127.0.0.1:8888/");
      this.setOutputData(0, "Booga");
    }
  
    litegraph.LiteGraph.registerNodeType(path+"/"+node.title, node);
    return node;
  };

export {createNode, createNodeEx};
  