import * as litegraph from "litegraph.js";
import { ExecSocket } from "@/types/ExecSocket";

const createNode = (type, params) => {
  const { inputs, outputs } = params;

  function node() {
    if (inputs) {
      Object.keys(inputs).forEach((key) => this.addInput(key, inputs[key]));
    }

    if (outputs) {
      Object.keys(outputs).forEach((key) => this.addOutput(key, outputs[key]));
    }

    Object.keys(params).forEach((key) => {
      if (key === "title" || key === "inputs" || key === "outputs") return;
      if (typeof params[key] === "function") return;

      this[key] = params[key];
    });
  }

  Object.keys(params).forEach((key) => {
    if (key === "title" || key === "inputs" || key === "outputs") return;

    if (typeof params[key] === "function") {
      node.prototype[key] = params[key];
    }
  });

  if (params.title) {
    node.title = params.title;
  }

  litegraph.LiteGraph.registerNodeType(type, node);
  return node;
};

const createNodeEx = (path, params) => {
  const { inputs, outputs } = params;

  function node() {
    if (inputs) {
      Object.keys(inputs).forEach((key) => this.addInput(key, inputs[key]));
    }

    if (outputs) {
      Object.keys(outputs).forEach((key) => this.addOutput(key, outputs[key]));
    }

    Object.keys(params).forEach((key) => {
      if (key === "title" || key === "inputs" || key === "outputs") return;
      if (typeof params[key] === "function") return;

      this[key] = params[key];
    });

    this.execsocket = new ExecSocket();
    this.data = ""; //data that has come from running the tool
    this.dirty = true; //do we have new data?
    this.running = false; //are we currently running?
    this.url = params.url;
    this.forge_id = params.forge_id;
    this.tool_name = params.title;
    this.addProperty("url", params.url);
    //this.addProperty("shellurl", "http://127.0.0.1:9998/aurlforashell");
    //this.addProperty("execurl", document.location.host + "/some exec url");
  }

  Object.keys(params).forEach((key) => {
    if (key === "title" || key === "inputs" || key === "outputs") return;

    if (typeof params[key] === "function") {
      node.prototype[key] = params[key];
    }
  });

  if (params.title) {
    node.title = params.title;
  }
  if (params.desc) {
    node.desc = params.desc;
  }

  node.prototype.onExecute = function () {
    //console.log(this);
    if (this.running == true) {
      //not sure?
    } else {
      this.running = true;
      console.log("Starting node " + params.title);
      let thisObj = this;

      //A callback for the socket to use when finishing.
      const executed = function (result) {
        thisObj.running = false;
        thisObj.onFinish(result);
      };
      let argdata = {};
      for (let prop in this.inputs) {
        argdata[this.inputs[prop].name] = this.getInputData(prop);
      }
      this.execsocket.setToolDetails(this.forge_id, this.tool_name, argdata);

      this.execsocket.start(this.url);
      //this.setOutputData(0, "Booga");
    }
  };
  node.prototype.onFinish = function (data) {
    this.data = data;
    this.dirty = false;
    this.running = false;
    this.setOutputData(0, JSON.parse(data));
  };

  node.prototype.reset = function () {
    this.dirty = false;
  };

  node.prototype.onStart = function () {
    this.reset();
  };
  node.prototype.onStop = function () {
    this.reset();
    this.running = false;
  };

  litegraph.LiteGraph.registerNodeType(path + "/" + node.title, node);
  return node;
};

export { createNode, createNodeEx };
