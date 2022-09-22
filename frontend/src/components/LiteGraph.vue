<template>
  <div class="litegraph litegraph-editor">
    <button @click="play()">
      <i class="mdi mdi-flask" aria-hidden="true"></i>
      START
    </button>
    <button @click="stop()">
      <i class="mdi mdi-flask" aria-hidden="true"></i>
      STOP
    </button>
    <LiteGraphSerialiser :graph="graph"></LiteGraphSerialiser>
    <canvas ref="canvas" class="graph-canvas"></canvas>
    <canvas ref="output" class="output-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Forge } from "../types/Forge";
import {
  ForgeTool,
  PositionalValue,
  FlaggedValue,
  OutputValue,
} from "../types/ForgeTool";
import { JSONResponse } from "../types/JSONResponse";
import { createNode, createNodeEx } from "../utils/liteGraphUtils";
import { defineComponent, onMounted, PropType, ref, watch } from "vue";
import * as litegraph from "litegraph.js";
import uuid4 from "uuid";
import "litegraph.js/css/litegraph.css";
import { createExecNode, ExecNode } from "../utils/execNode";
import LiteGraphSerialiser from "./LiteGraphSerialiser.vue";

export default defineComponent({
  name: "LiteGraph",
  props: {
    forgesArray: {
      required: true,
      type: Array as PropType<Forge[]>,
    },
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>();
    const context = ref<CanvasRenderingContext2D | null>();
    const output = ref<HTMLCanvasElement>();
    const outputContext = ref<CanvasRenderingContext2D | null>();
    let graph = ref<litegraph.LGraph>(); // = null;
    let lGraphCanvas: litegraph.LGraphCanvas; // = null;
    const forgeTools = ref<ForgeTool[]>([]);
    const backendURL_WS: string = import.meta.env.VITE_BACKEND_URL_WS;
    watch(forgeTools, async (newForgeTools, oldForgeTools) => {
      //Not sure what I wanted to do here?
      console.log("New");
    });
    (async () => {
      //console.log(props.forgesArray);
      //console.log("Listing forges");
      props.forgesArray.forEach(async (forge: Forge) => {
        let ret: JSONResponse<ForgeTool[]> = await forge.getDetails();
        //console.log("I am a forge: " + forge.name);
        //console.log(`I have tools:`);
        ret?.data?.forEach((tool: ForgeTool) => {
          forgeTools.value.push(tool);
          let tool_inputs: Map<string, string> = new Map<string, string>();
          let tool_output: Map<string, string> = new Map<string, string>();
          tool.args.forEach(
            (
              value: PositionalValue | FlaggedValue,
              index: number,
              array: (PositionalValue | FlaggedValue)[]
            ) => {
              //console.log(array[index]);
              //console.log(value);
              tool_inputs.set(value.name, value.value_type);
            }
          );
          tool_output.set(tool.output.name, tool.output.value_type);
          createNodeEx(forge.name, {
            inputs: Object.fromEntries(tool_inputs),
            outputs: Object.fromEntries(tool_output),
            forge_id: forge.id,
            title: tool.name,
            url: `${backendURL_WS}/forges/run/${forge.id}/${tool.name}/`,
          });
        });
      });
    })();
    onMounted(() => {
      window.addEventListener("resize", resize);
      //const bufferCanvas = document.createElement("canvas");
      //const bufferContext = bufferCanvas.getContext("2d");
      //Output Canvas
      output.value = document.createElement("canvas");
      if (canvas.value && output.value) {
        outputContext.value = output.value.getContext("2d");
        context.value = canvas.value.getContext("2d");
        graph.value = new litegraph.LGraph();
        lGraphCanvas = new litegraph.LGraphCanvas(canvas.value, graph.value);
        lGraphCanvas.resize();
        resize();
        //this.graph.start(); //this will be done by a button
        createNode("Multiforge/ParseJSON", {
          inputs: { json: "string" },
          outputs: { obj: "object" },
          title: "ParseJSON",
          desc: "ParsesJSON from a string to an object",
          onExecute() {
            let data: string = this.getInputData(0);
            if (data && data !== this.data) {
              this.data = data;
              const obj = JSON.parse(this.data);
              this.setOutputData(obj);
            }
          },
        });
        createNode("Multiforge/TextDisplay", {
          inputs: { text: "string" },
          outputs: { text: "string" },
          title: "Text Display",
          desc: "Displays text",
          properties: { textValue: "Hello" },
          widgets: [
            {
              name: "displayText",
              type: "text",
              text: "",
              options: { property: "textValue" },
            },
          ],
          onExecute() {
            this.setOutputData(this.getInputData(0));
            this.setProperty("textValue", this.getInputData(0));
          },
        });
      }
      /*

                  createNode("modV/visualInput", {
            title: "Visual Input",
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              if (
                this.outputs[0] &&
                this.outputs[0].links &&
                !this.outputs[0].links.length
              ) {
                return;
              }

              this.setOutputData(0, {
                canvas: bufferCanvas,
                context: bufferContext,
                delta: Date.now()
              });
            }
          });

          createNode("modV/visualOutput", {
            title: "Visual Output",
            inputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              if (!renderContext) {
                return;
              }
              outputContext.value.clearRect(0, 0, output.value.width, output.value.height);
              outputContext.value.drawImage(renderContext.canvas, 0, 0);
            }
          });

          createNode("modV/contextSplitter", {
            title: "Context Splitter",
            inputs: {
              context: "renderContext"
            },
            outputs: {
              canvas: "canvas",
              canvasContext: "canvasContext",
              delta: "number"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              if (!renderContext) return;

              const { canvas, context, delta } = renderContext;

              this.setOutputData(0, canvas);
              this.setOutputData(1, context);
              this.setOutputData(2, delta);
            }
          });

          createNode("modV/visualMonitor", {
            title: "Visual Monitor",
            inputs: {
              context: "renderContext"
            },
            size: [300, 200],
            onExecute() {
              this._renderContext = this.getInputData(0);
              this.setDirtyCanvas(true, false);
            },
            onDrawForeground(nodeContext) {
              const [width, height] = this.size;
              const { _renderContext: rCtx } = this;
              if (!rCtx) return;

              const { canvas } = rCtx;
              nodeContext.drawImage(canvas, 0, 0, width, height);
            }
          });

          createNode("modV/contextJoiner", {
            title: "Context Joiner",
            inputs: {
              canvas: "canvas",
              canvasContext: "canvasContext",
              delta: "number"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const canvas = this.getInputData(0);
              const context = this.getInputData(1);
              const delta = this.getInputData(2);

              this.setOutputData(0, { canvas, context, delta });
            }
          });

          createNode("modV/modules/circle", {
            title: "Circle",
            inputs: {
              context: "renderContext",
              circleSize: "number"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              const circleSize = this.getInputData(1) || 1;

              if (
                renderContext &&
                this.outputs[0] &&
                this.outputs[0].links &&
                this.outputs[0].links.length
              ) {
                const { canvas, context, delta } = renderContext;
                const { width, height } = canvas;
                const newSize = circleSize * (2 + Math.sin(delta / 1000) * 1.1);

                context.strokeStyle = context.fillStyle = "rgba(0,0,0,0.001)";
                context.fillRect(0, 0, width, height);
                context.strokeStyle = context.fillStyle = `hsl(${delta /
                  40}, 80%, 50%)`;
                context.beginPath();
                context.arc(width / 2, height / 2, newSize, 0, Math.PI * 2);
                // context.closePath();
                context.stroke();
              }

              this.setOutputData(0, renderContext);
            }
          });

          createNode("modV/modules/squishy", {
            title: "Squishy",
            inputs: {
              context: "renderContext"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);

              if (
                renderContext &&
                this.outputs[0] &&
                this.outputs[0].links &&
                this.outputs[0].links.length
              ) {
                const { canvas, context, delta } = renderContext;
                const { width, height } = canvas;
                context.drawImage(
                  canvas,
                  Math.cos(delta / 900) * 5 + Math.cos(delta / 100),
                  Math.sin(delta / 5000 + 5 * Math.sin(delta / 500)) * 10 -
                    Math.cos(delta / 500),
                  width + 20 * Math.sin(delta / 800),
                  height + 20 * Math.cos(delta / 600 + 2 * Math.sin(delta / 500))
                );
              }

              this.setOutputData(0, renderContext);
            }
          });

          createNode("modV/modules/blockColor", {
            title: "Block Colour",
            inputs: {
              context: "renderContext",
              r: "number",
              g: "number",
              b: "number",
              a: "number"
            },
            outputs: {
              context: "renderContext"
            },
            onExecute() {
              const renderContext = this.getInputData(0);
              const r = this.getInputData(1);
              const g = this.getInputData(2);
              const b = this.getInputData(3);
              const a = this.getInputData(4);

              if (
                renderContext &&
                this.outputs[0] &&
                this.outputs[0].links &&
                this.outputs[0].links.length
              ) {
                const { canvas, context, delta } = renderContext;
                const { width, height } = canvas;
                context.fillStyle = `rgba(${r * 255},${g * 255},${b * 255},${a *
                  255})`;
                context.fillRect(0, 0, width, height);
              }

              this.setOutputData(0, renderContext);
            }
          });
          */
      //console.log("Finished OnMounted");
    });
    const resize = () => {
      const { devicePixelRatio: dpr } = window;
      if (canvas.value) {
        canvas.value.width = window.innerWidth * dpr;
        canvas.value.height = window.innerHeight * dpr;
        canvas.value.style.width = `${window.innerWidth}px`;
        canvas.value.style.height = `${window.innerHeight}px`;
      }
    };
    const play = () => {
      console.log("PLAY");
      if (graph.value?.status == litegraph.LGraph.STATUS_STOPPED) {
        graph.value?.start();
      }
    };
    const stop = () => {
      console.log("STOP");
      if (graph.value?.status != litegraph.LGraph.STATUS_STOPPED) {
        graph.value?.stop();
      }
    };
    return { canvas, context, outputContext, graph, resize, play, stop };
  },
  components: { LiteGraphSerialiser },
});
</script>

<style scoped>
canvas.graph-canvas {
  position: relative;
  top: 0;
  left: 0;
}

canvas.output-canvas {
  position: relative;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
</style>
