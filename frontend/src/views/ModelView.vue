<template>
  <div class="model">
    <h1>Model Definition</h1>
    <p>Model procedural metaparameters here</p>
    <div id="model-litegraph">
      <LiteGraph :forgesArray="modelsArray" :projectsArray="projectsArray" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Forge } from "../types/Forge";
import { MetaGraphProject } from "../types/MetaGraph";
import { JSONResponse } from "../types/JSONResponse";
import getForges from "../utils/getForge";
import getProjects from "../utils/getProject";
import LiteGraph from "../components/LiteGraph.vue";

const modelsArray = ref<Forge[]>([]);
const projectsArray = ref<MetaGraphProject[]>([]);
</script>

<style>
canvas.graph-canvas {
  background-color: #ccffcc;
}
</style>
