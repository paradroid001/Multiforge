<template>
  <div class="forge-list">
    <ul>
      <li v-for="forge in forgesArray" :key="forge.id">
        <h3>
          <i class="mdi mdi-tools">{{ forge.name }}</i>
        </h3>
        <div class="url">
          <a :href="forge.url">{{ forge.url }}</a>
        </div>
        <div v-if="forge.status == 'offline'">Forge is offline</div>
        <div v-if="forge.status == 'online'">
          <div>Forge is ALIVE</div>
          <div>{{ forge.stats }}</div>
          <div v-if="forge.tools">
            <ToolList :tools="forge.tools" :order="order" />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Forge } from "../types/Forge";
import { OrderTerm } from "../types/OrderTools";
import { JSONResponse } from "../types/JSONResponse";
import { ForgeTool } from "../types/ForgeTool";
import ToolList from "../components/ToolList.vue";

const props = defineProps<{
  forgesArray: Forge[];
  url: string;
}>();
const order: OrderTerm = "id";

onMounted(async () => {
  await Promise.all(
    props.forgesArray.map(async (forge) => {
      if (forge) {
        //console.log("OnMounted requesting tools for forge " + forge.id);
        const resp: JSONResponse<ForgeTool[]> = await forge.getDetails();
        forge.tools = resp.data ? resp.data : [];
        //console.log(`Got forge tools ${forge.tools}`);
        const statusresp: JSONResponse<{}> = await forge.checkStatus(props.url);
      }
    })
  );
});
</script>

<style>
.forge-list {
  background: #c9c9c9;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}
.forge-list li {
  border-radius: 4px;
  border: 3px solid black;
  padding: 3px;
}
</style>
