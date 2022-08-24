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

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ToolList from '../components/ToolList.vue';
import getTools from '@/utils/getTool';
import JSONResponse from '@/types/JSONResponse';
import ForgeTool from '@/types/ForgeTool';
import OrderTerm from '@/types/OrderTools';

export default defineComponent({
    name: "ToolsList",
    components: {
        ToolList
    },
    setup() {

        const {loadTools} = getTools();
        const toolArray = ref<ForgeTool[]>([]);
        const error = ref<string | null>(null);
        let tools: ForgeTool[] = [];
        (async() => {
          let backendURL = "http://127.0.0.1:8000/api/tools/";
          let ft:JSONResponse<ForgeTool[]> = await loadTools(backendURL);
          if (ft.data)
          {
            tools = ft.data;
          }
          
        })();

        /*
        const tools: ForgeTool[] = [
            {name:"One", id:"1", url:"http://www.something.com"},
            {name:"Two", id:"2", url:"http://www.something.com"},
            {name:"Three", id:"3", url:"http://www.something.com"},
            {name:"Four", id:"4", url:"http://www.something.com"}
        ];
        */
        const order = ref<OrderTerm>('id');
        const handleClick = (term: OrderTerm) => {
            order.value = term;
        };
        return {tools, order, handleClick};
    }
});
</script>

<style>
</style>