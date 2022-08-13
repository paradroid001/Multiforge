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
    <canvas ref="canvas" class="graph-canvas" ></canvas>
    <canvas ref="output" class="output-canvas" ></canvas>
  </div>
</template>

<script lang="ts">
import { createNode, createNodeEx } from "@/utils/liteGraphUtils";
import { defineComponent, onMounted, PropType, ref } from "vue";
import * as litegraph from "litegraph.js";
import uuid4 from "uuid";
import "litegraph.js/css/litegraph.css";

export default defineComponent ({
    name: "LiteGraph",
    props: {

    },
    setup(props) {
        const canvas = ref(null);
        //let canvas = ref(null);
        const context= ref(null);
        const output = ref(null);
        const outputContext = ref(null);
        let graph = null;
        let lGraphCanvas = null;

        onMounted( () => {
            window.addEventListener("resize", resize);

            context.value = canvas.value.getContext("2d");
            
            resize();
            
            //Output Canvas
            output.value = document.createElement("canvas");
            outputContext.value = output.value.getContext("2d");
            
            const bufferCanvas = document.createElement("canvas");
            const bufferContext = bufferCanvas.getContext("2d");

            graph = new litegraph.LGraph();
            lGraphCanvas = new litegraph.LGraphCanvas(canvas.value, graph);
            lGraphCanvas.resize();
            //this.graph.start(); //this will be done by a button
            
            
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
            

        });

        const resize= () => {
            const { devicePixelRatio: dpr } = window;
            canvas.value.width = window.innerWidth * dpr;
            canvas.value.height = window.innerHeight * dpr;
            canvas.value.style.width = `${window.innerWidth}px`;
            canvas.value.style.height = `${window.innerHeight}px`;
        };

        const play = () => {
            console.log("PLAY");
            if (graph.status == litegraph.LGraph.STATUS_STOPPED) {
                graph.start();
            }
        };

        const stop = () => {
            console.log("STOP");
            if (graph.status != litegraph.LGraph.STATUS_STOPPED) {
                graph.stop();
            }
        };

        return {canvas, context, outputContext, resize, play, stop};
    }
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

