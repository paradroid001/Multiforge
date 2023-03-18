<template>
  <div class="workflow">
    <h1>Workflow</h1>
    <p>Here you do workflows.</p>
    <div id="litegraph" v-if="forgeArray.length">
      <LiteGraph :forgesArray="forgeArray" :projectsArray="projectsArray" />
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

const forgeArray = ref<Forge[]>([]);
const projectsArray = ref<MetaGraphProject[]>([]);

const { loadForges } = getForges();
const { loadProjects } = getProjects();
const error = ref<string | null>(null);
(async () => {
  const forgesBackendURL = ref<string>(
    import.meta.env.VITE_BACKEND_URL + "/forges"
  );
  let f: JSONResponse<Forge[]> = await loadForges(forgesBackendURL.value);
  forgeArray.value = f.data ? f.data : [];

  const projectsBackendURL = ref<string>(
    import.meta.env.VITE_BACKEND_URL + "/metagraph/projects/"
  );
  let projects: JSONResponse<MetaGraphProject[]> = await loadProjects(
    projectsBackendURL.value
  );
  projectsArray.value = projects.data ? projects.data : [];
})();
</script>

<style>
canvas.graph-canvas {
  background-color: #ccccff;
}
</style>

<!--
<script lang="ts">
  import getForges from "@/utils/getForge";
  import Forge from "@/types/Forge";
  import JSONResponse from '@/types/JSONResponse';
  import { defineComponent, onMounted, ref, computed } from 'vue';
  
  export default defineComponent({
    name: "WorkflowView",
    components: {
      LiteGraph
    },
    setup()
    {
      const {loadForges} = getForges();
      const forgeArray = ref<Forge[]>([]);
      const error = ref<string | null>(null);
      (async () => {
        let backendURL = "http://127.0.0.1:8000/api/forges/";
        let f:JSONResponse<Forge[]> = await loadForges(backendURL);        
        forgeArray.value = f.data ? f.data:[];
      })();

      return {
        error, forgeArray
      };
    }
  });
</script>

<style>
html,
body {
  height: 100%;
  position: relative;
  margin: 0;
}
</style>
-->
