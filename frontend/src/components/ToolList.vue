<template>
  <div class="tool-list">
    <p>Ordered By {{ props.order }}</p>
    <transition-group name="toollist" tag="ul">
      <!--<ul>-->
      <li v-for="tool in orderedTools" :key="tool.name">
        <h2>
          <i class="mdi mdi-tools">
            {{ tool.name }}
          </i>
        </h2>
        <div class="url">
          <!--this isn't a thing. No url.-->
          <a :href="tool.url">
            <i class="mdi mdi-link"></i>
            args: {{ tool.args }}
          </a>
        </div>
        <div class="root">
          <p>Root: {{ tool.root }}</p>
        </div>
        <div class="command">
          <p>Command: {{ tool.command }}</p>
        </div>
        <div class="description">
          <p>Description: {{ tool.description }}</p>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import { ForgeTool } from "../types/ForgeTool";
import { OrderTerm } from "../types/OrderTools";

const props = defineProps<{
  tools: ForgeTool[];
  order: OrderTerm;
}>();
const orderedTools = computed(() => {
  //console.log("Num tools = " + props?.tools?.length);
  //console.log(props?.tools);
  return [...props.tools].sort((a: ForgeTool, b: ForgeTool) => {
    return a[props.order] > b[props.order] ? 1 : -1;
  });
});
</script>

<style scoped>
.tool-list {
  max-width: 960px;
  margin: 40px auto;
}
.tool-list ul {
  padding: 0;
}
.tool-list li {
  list-style-type: none;
  background: rgb(143, 143, 143);
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
}
.tool-list h2 {
  margin: 0 0 10px;
  text-transform: captalize;
}
.url {
  display: flex;
}
.url p {
  color: #17bf66;
  font-weight: bold;
  margin: 10px 4px;
}

.toollist-move {
  transition: all 0.3s;
}
</style>
