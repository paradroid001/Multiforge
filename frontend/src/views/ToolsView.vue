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
import ForgeTool from '@/types/ForgeTool';
import OrderTerm from '@/types/OrderTools';

export default defineComponent({
    name: "ToolsList",
    components: {
        ToolList
    },
    setup() {
        const tools: ForgeTool[] = [
            {name:"One", id:"1", url:"http://www.something.com"},
            {name:"Two", id:"2", url:"http://www.something.com"},
            {name:"Three", id:"3", url:"http://www.something.com"},
            {name:"Four", id:"4", url:"http://www.something.com"}
        ];
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