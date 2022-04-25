<template>
    <div class="forge-list">
        <ul>
            <li v-for="forge in forgesArray" :key="forge.id">
                <h3>
                    <i class="mdi mdi-tools">{{forge.name}}</i>
                </h3>
                <div class="url">
                    <a :href="forge.url">{{forge.url}}</a>
                </div>
                <div v-if="forge.status=='offline'">
                    Forge is offline
                </div>
                
                <div v-if="forge.tools">
                    <ToolList :tools="forge.tools" :order="order"/>
                </div>
                
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from "vue";
import Forge from '@/types/Forge';
import OrderTerm from "@/types/OrderTools";
import JSONResponse from "@/types/JSONResponse";
import ForgeTool from "@/types/ForgeTool";
import ToolList from "./ToolList.vue";
export default defineComponent({
    name: "ForgeList",
    components: {
        ToolList
    },
    props: {
        forgesArray: {
            required: true,
            type: Array as PropType<Forge[]>
        }
    },
    setup(props) {
        const order:OrderTerm="id";
        const forges = ref<Forge[]>([]);
        console.log(props.forgesArray);

        
        //Async foreach loop:
        //See:
        //https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
        ( async () => {
            console.log("running that async function");
            /*
            await Promise.all(props.forgesArray.map( async (forge) =>{
                if (forge)
                {
                    console.log("requesting tools for forge " + forge.id);
                    const resp: JSONResponse<ForgeTool[]> = await getDetails(forge.url);
                    forge.tools = resp.data? resp.data : [];
                    console.log("Got forge tool");
                    console.log(forge.tools);
                }
            }));
            */
        });
        
        
        onMounted(async () => {
            await Promise.all(props.forgesArray.map( async (forge) => {
                if (forge) {
                    console.log("OnMounted requesting tools for forge " + forge.id);
                    //console.log("This forge us called " + forge.name);
                    //console.log("this has a getdetais: " + forge.getDetails);
                    const resp: JSONResponse<ForgeTool[]> = await forge.getDetails();
                    forge.tools = resp.data? resp.data : [];
                    //console.log("Got forge tool");
                    //console.log(forge.tools);
                }
            }));
            
        });
        
        
        //const forgeList = ref<Forge[]>(props.forges);
        return {order, forges}; //forgeList}
    }
});

</script>

<style>
    .forge-list {
        background: #aaaaaa;
        border-radius: 4px;
        padding: 16px;
        margin: 16px 0;
    }
</style>