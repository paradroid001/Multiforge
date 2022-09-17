<template>
  <div class="about">
    <h1>Forges</h1>
    <p>See your forges here!</p>
    <div v-if="error">{{ error }}</div>
    <div v-if="forgeArray.length">
      <ForgeList :forgesArray="forgeArray" :url="backendURL" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Forge } from "../types/Forge";
import { ForgeTool } from "../types/ForgeTool";
import { JSONResponse } from "../types/JSONResponse";
import ForgeList from "../components/ForgeList.vue";
import getForges from "../utils/getForge";

const { loadForges } = getForges();
const forgeArray = ref<Forge[]>([]);
const error = ref<string | null>(null);
//const backendURL = ref<string>("http://127.0.0.1:8000/api");
const backendURL = ref<string>(import.meta.env.VITE_BACKEND_URL);
(async () => {
  let f: JSONResponse<Forge[]> = await loadForges(
    backendURL.value + "/forges/"
  );
  forgeArray.value = f.data ? f.data : [];
})();
</script>

<!--
<script lang="ts">
  import getForges from "@/utils/getForge";
  import Forge from "@/types/Forge";
  import ForgeTool from "@/types/ForgeTool"
  import JSONResponse from '@/types/JSONResponse';
  import { defineComponent, onMounted, ref, computed } from 'vue';

  export default defineComponent({
    name: "ForgeView",
    components: {ForgeList},
    setup() 
    {
      const {loadForges} = getForges();
      const forgeArray = ref<Forge[]>([]);
      const error = ref<string | null>(null);

      //This little async thing:
      //See
      //https://stackoverflow.com/questions/64117116/how-can-i-use-async-await-in-the-vue-3-0-setup-function-using-typescript
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
-->
