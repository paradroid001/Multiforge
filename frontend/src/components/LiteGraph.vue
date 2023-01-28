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
console.log("Starting imports for LiteGraph.vue");
import { Forge } from "../types/Forge";
import {
  ForgeTool,
  PositionalValue,
  FlaggedValue,
  OutputValue,
} from "../types/ForgeTool";
import { JSONResponse } from "../types/JSONResponse";
import { defineComponent, onMounted, PropType, ref, watch } from "vue";
console.log("Importing GLMAtrix");

import * as glMatrix from "gl-matrix-ts";
//import { vec3, vec4, mat3, mat4, quat } from "gl-matrix-ts";
globalThis.glMatrix = glMatrix;
//window.glMatrix = glMatrix;
//global.glMatrix = glMatrix;

console.log("Importing litegraph ok");
import * as litegraph from "litegraph.js";

import uuid4 from "uuid";
import "litegraph.js/css/litegraph.css";
import { createExecNode, ExecNode } from "../utils/execNode";
import LiteGraphSerialiser from "./LiteGraphSerialiser.vue";
import { createNode, createNodeEx } from "../utils/liteGraphUtils";
import { createMultiForgeNodes } from "../utils/multiForgeTools";

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
    const backendURL: string = import.meta.env.VITE_BACKEND_URL;

    watch(forgeTools, async (newForgeTools, oldForgeTools) => {
      //Not sure what I wanted to do here?
      console.log("New");
    });

    (async () => {
      props.forgesArray.forEach(async (forge: Forge) => {
        let ret: JSONResponse<ForgeTool[]> = await forge.getDetails();
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

        //Create the 'static' multiforge nodes
        createMultiForgeNodes(
          backendURL,
          graph.value,
          "asset_ID_goes_here",
          window.navigator.userAgent,
          (): object => {
            console.log("Done");
            return {};
          }
        );
      }

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
