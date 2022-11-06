import * as litegraph from "litegraph.js";
import { ExecSocket } from "../types/ExecSocket";

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

    if (this.init) {
      this.init();
    } else {
      console.log(`there was not an init for ${params.title}`);
    }
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

    this.execsocket = new ExecSocket(this);
    this.data = ""; //data that has come from running the tool
    this.dirty = true; //do we have new data?
    this.running = false; //are we currently running?
    this.url = params.url;
    this.arg_struct = params.arg_struct;
    this.forge_id = params.forge_id;
    this.tool_name = params.title;

    this.inputcache = {};

    this.addProperty("url", params.url);
    this.addProperty("debug", false);
    this.addProperty("useCachedValue", false);
    //console.log(`debug property is ${this.properties["debug"]}`);

    this.debugToggle = this.addWidget("toggle", "debug", false, {
      property: "debug",
    });
    this.cacheToggle = this.addWidget("toggle", "useCache", false, {
      property: "useCachedValue",
    });

    //this.addProperty("shellurl", "http://127.0.0.1:9998/aurlforashell");
    //this.addProperty("execurl", document.location.host + "/some exec url");
    //Run init if it exists
    if (this.init) {
      this.init();
    } else {
      console.log(`there was not an init for ${params.title}`);
    }
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

  node.prototype.isDebug = function () {
    return this.properties["debug"];
  };

  node.prototype.log = function () {
    //if (this.isDebug()) {
    console.log(...arguments);
    //}
  };

  node.prototype.onExecute = function () {
    console.log(`${this.title} is executing`);
    //Only run if something in the input changes
    //OR if there are no inputs.
    for (let name in this.inputcache) {
      let val = this.getInputDataByName(name);
      if (val != this.inputcache[name]) {
        this.dirty = true;
        console.log(
          this.title +
            " input " +
            name +
            " changed from " +
            this.inputcache[name] +
            " to " +
            val
        );
        this.inputcache[name] = val;
      }
    }

    //console.log(this);
    if (this.dirty === true && this.running === false) {
      this.running = true;
      this.log("Starting node " + params.title);
      let thisObj = this;

      //A callback for the socket to use when finishing.
      const executed = function (result) {
        thisObj.running = false;
        thisObj.onFinish(result);
      };
      let argdata = [];
      for (let prop in this.inputs) {
        this.arg_struct[prop].value = this.getInputData(prop);
        argdata.push(this.arg_struct[prop]);
        //argdata[this.inputs[prop].name] = this.getInputData(prop);
        //this.arg_struct[prop]
      }
      this.execsocket.setToolDetails(this.forge_id, this.tool_name, argdata);
      this.execsocket.setFinishCallback(executed);
      this.execsocket.start(this.url);
    } else {
      this.onFinish(this.data);
    }
  };
  node.prototype.onFinish = function (data) {
    if (this.data != data) {
      this.data = data;
      this.dirty = false;
      //this.running = false;
      let output = JSON.parse(data);
      //console.log("onFinish of Node was:");
      //console.log(output["out"]);
      //console.log("Setting output data with length " + output["out"].length);
      this.setOutputData(0, output["out"]);
      //TODO: You could do something with 'err' here.
    }
  };

  node.prototype.reset = function () {
    this.dirty = false;
    if (this.inputs) {
      for (let prop of this.inputs) {
        this.inputcache[prop.name] = undefined;
      }
    } else {
      //if you have no inputs, we will mark
      //you dirty once, so you can do your thing.
      this.dirty = true;
    }
  };

  node.prototype.onStart = function () {
    this.reset();
  };
  node.prototype.onStop = function () {
    this.reset();
    //this.running = false;
  };

  node.prototype.onDrawBackground = function (nodeContext) {
    if (this.flags.collapsed) return;
    this.boxcolor = this.running ? "#f00" : "#345";
    var size = this.size;
    //nodeContext.save()
    //console.log("DRAWING");
    let ctx = nodeContext;
    ctx.save();
    //ctx.fillStyle = this.boxcolor;
    //ctx.fillRect(0, 0, size[0], size[1]);
    ctx.strokeStyle = this.boxcolor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size[0], 0);
    ctx.lineTo(size[0], size[1]);
    ctx.lineTo(0, size[1]);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.restore();
  };

  node.prototype.onDrawForeground = function (ctx, graphcanvas) {
    this.boxcolor = this.running ? "#f00" : "#345";
  };

  litegraph.LiteGraph.registerNodeType(path + "/" + node.title, node);
  return node;
};

export { createNode, createNodeEx };
