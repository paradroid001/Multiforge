<template>
  <div class="about">
    <h1>Forges</h1>
    <p>See your forges here!</p>
    <div v-if="error">{{error}}</div>
    <div v-if="forgeArray.length">
      <ForgeList :forgesArray="forgeArray" />
    </div>
  </div>
</template>

<script lang="ts">
  import ForgeList from '../components/ForgeList.vue';
  import getForges from "@/utils/getForge";
  import Forge from "@/types/Forge";
  import ForgeTool from "@/types/ForgeTool"
  import JSONResponse from '@/types/JSONResponse';
  import { defineComponent, onMounted, ref, computed } from 'vue';

  export default defineComponent({
    name: "ForgeView",
    components: {ForgeList},
    setup() {
      const {loadForges} = getForges();
      const forgeArray = ref<Forge[]>([]);
      const error = ref<string | null>(null);


      /*
      const computedForgeArray = computed( () => {
        console.log(`forgearray changed: ${forgeArray.value}`);
        return forgeArray.value;
      });
      */

      /*
      (async () => {
      //onMounted(async () => {
        let result = await loadForges("http://127.0.0.1:8000/forges/");
        error.value = result.errors; 
        //console.log(`Forgearray data = `);
        //console.log(result.data);
        if (result.data)
        {
          result.data.forEach((forge() => {
            forgeArray.value.push(forge);
          }));
        }
        //forgeArray.value = result.data?result.data:[];
      //});
      })();
      */

      
      //This little async thing:
      //See
      //https://stackoverflow.com/questions/64117116/how-can-i-use-async-await-in-the-vue-3-0-setup-function-using-typescript
      (async () => {
        console.log("forgview ran an async");
        //const j = new JSONResponse<Forge[]>();
        //let f:JSONResponse<Forge[]> = await j.load("http://127.0.0.1:8000/forges/");
        let f:JSONResponse<Forge[]> = await loadForges("http://127.0.0.1:8000/forges/");
        forgeArray.value = f.data ? f.data:[];

        /* This code works
        let result = await loadForges("http://127.0.0.1:8000/forges/");
        console.log(result);
        if (result.data){
          result.data.forEach((forge) => {
            const f = new Forge();
            f.name = forge.name;
            f.id = forge.id;
            f.url = forge.url;
            forgeArray.value.push(f);
          });
          console.log("After data retrieval:");
          console.log(forgeArray.value);
        }
        */
      })();
      

      /*
      let ft1: ForgeTool = {name: "My tool", url: "http://127.0.0.1/", id: "1"};
      
      let f1 = new Forge();
      f1.name = "First forge";
      f1.url = "http://127.0.0.1:8888";
      f1.tools = [ft1];
      f1.status = "offline";
      f1.id = "1";
      forgeArray.value.push(f1);
      */

      return {
        error, forgeArray
      };
    }
  });
  
</script>
