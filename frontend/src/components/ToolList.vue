<template>
  <div class="tool-list">
    <p>Ordered By {{ props.order }}</p>
    <transition-group name="toollist" tag="ul">
      <!--<ul>-->
      <li v-for="tool in orderedTools" :key="tool.name">
        <h2>
          <i class="mdi mdi-tools"></i>
          {{ tool.name }}
        </h2>
        <div class="url">
          <a :href="tool.url">
            <i class="mdi mdi-link"></i>
            {{ tool.url }}
          </a>
        </div>
        <div class="description">
          <p>
            {{ tool.description }}
          </p>
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
  /*
        tools: {
            required: true,
            type: Array as PropType<ForgeTool[]> //propType gives us typed props
        },
        order: {
            required: true,
            type: String as PropType<OrderTerm>
        }
        */
}>();
const orderedTools = computed(() => {
  console.log("Num tools = " + props?.tools?.length);
  console.log(props?.tools);
  //return props.tools;
  //new temp array, so we aren't mutating tools prop
  return [...props.tools].sort((a: ForgeTool, b: ForgeTool) => {
    return a[props.order] > b[props.order] ? 1 : -1;
  });
});
</script>

<!--
<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import ForgeTool from '@/types/ForgeTool'
import OrderTerm from '@/types/OrderTools'

export default defineComponent({
    props: {
        tools: {
            required: true,
            type: Array as PropType<ForgeTool[]> //PropType gives us typed props
        },
        order: {
            required: true,
            type: String as PropType<OrderTerm>
        }
    },
    setup(props) {

        /*
        const orderedTools = computed( () => {
            //new temp array, so we aren't mutating tools prop
            return [...props.tools].sort( (a: ForgeTool, b: ForgeTool) => {
                return a[props.order] > b[props.order] ? 1 : -1;
            }); 
        });
        */
        const orderedTools = computed( () => {
            console.log("Num tools = " + props.tools.length);
            console.log(props.tools);
           return props.tools;
        });

        return { orderedTools }
    }
})
</script>
-->

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
