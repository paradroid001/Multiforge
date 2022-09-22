<template>
  <header>
    <div class="title">
      <h1>
        <i class="mdi mdi-toolbox"></i>
        Tools
      </h1>
    </div>
    <div class="order">
      <button @click="handleClick('name')">
        <i class="mdi mdi-flask" aria-hidden="true"></i>
        Order by title
      </button>
      <button @click="handleClick('url')">Order by url</button>
      <button @click="handleClick('id')">Order by id</button>
    </div>
  </header>
  <ToolList :tools="tools" :order="order" />
</template>

<script setup lang="ts">
import { ref } from "vue";

import { JSONResponse } from "../types/JSONResponse";
import { ForgeTool } from "../types/ForgeTool";
import { OrderTerm } from "../types/OrderTools";
import ToolList from "../components/ToolList.vue";

import getTools from "@/utils/getTool";

const order = ref<OrderTerm>("id");
const tools = ref<ForgeTool[]>([]);
const handleClick = (term: OrderTerm) => {
  order.value = term;
};

const backendurl = import.meta.env.VITE_BACKEND_URL;
const { loadTools } = getTools();
//const toolArray = ref<ForgeTool[]>([]);
//const error = ref<string | null>(null);
(async () => {
  //console.log("I am fetching backend tools");
  //console.log(`${backendurl}/tools`);
  let ft: JSONResponse<ForgeTool[]> = await loadTools(
    `${import.meta.env.VITE_BACKEND_URL}/tools/`
  );
  if (ft.data) {
    tools.value = ft.data;
  } else {
    console.log("Failed");
  }
})();
</script>
