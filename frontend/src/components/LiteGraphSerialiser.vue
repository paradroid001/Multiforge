<template>
  <div class="litegraph litegraph-editor">
    <input
      type="text"
      @input="onSaveNameChange($event)"
      v-model="saveSelected"
    />
    <button @click="save()">
      <i class="mdi mdi-flask" aria-hidden="true"></i>
      Save
    </button>
    <select
      name="loadgraphs"
      id="loadgraphs"
      @change="onLoadFileChange($event)"
      v-model="selected"
    >
      <option v-for="item in filenames" :value="item[0]">
        {{ item[1] }}
      </option>
    </select>
    <button @click="load()">
      <i class="mdi mdi-flask" aria-hidden="true"></i>
      Load
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import * as litegraph from "litegraph.js";
import { JSONResponse } from "../types/JSONResponse";
import { createMultiForgeNodes } from "../utils/multiForgeTools";

const props = defineProps<{ graph: litegraph.LGraph }>();
const backendurl = import.meta.env.VITE_BACKEND_URL;
const filenames = ref<string[][]>([]);
const saveName = ref<string>("");
let selected: string = ""; //selected graph to load.
let saveSelected: string;

const loadGraphNames = async () => {
  //console.log("Loading graphnames");
  const ret: JSONResponse<string[][]> = new JSONResponse<string[][]>();
  await ret.load(`${backendurl}/graphs/all/names/`);
  if (ret.data) {
    //console.log(ret.status);
    filenames.value = ret.data;
  }
};

//Load the graph names.
loadGraphNames();

const loadGraph = async (graph_id: string): Promise<string | null> => {
  //console.log("Trying to load graph " + graph_id);
  const req: JSONResponse<string> = new JSONResponse<string>();
  let ret: string | null = null;
  await req.load(`${backendurl}/graphs/${graph_id}/`);
  if (req.status == 200) {
    ret = req.data;
  }
  return Promise.resolve(ret);
};

const saveGraphName = async (
  name: string,
  content: string,
  url: string
): Promise<string[] | null> => {
  const response: JSONResponse<string[]> = new JSONResponse<string[]>();
  response.options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({ name: name, content: content }),
  };
  await response.load(url);
  if (response.status == 200) {
    return Promise.resolve(response.data);
  } else return Promise.resolve(null);
};

const load = async () => {
  //load whatever is currently selected in the dropdown.
  //console.log("load " + selected);
  let graphText = await loadGraph(selected);
  if (graphText) {
    //console.log("Load graph: ");
    //console.log(graphText);
    //TODO: Consider only having one function that does this.
    // The static nodes are also created in the main page.
    // They are getting recreated here because now we know
    // the asset id.
    let graphobj = JSON.parse(graphText);
    if (graphobj && graphobj.length != 0) {
      createMultiForgeNodes(
        backendurl,
        props.graph,
        selected,
        window.navigator.userAgent,
        (out: object): object => {
          console.log("Finish callback when we're run in the browser...");
          console.log(out);
          return out;
        }
      );
      props.graph.configure(graphobj);
    }
  } else {
    console.log("No graph data to load");
  }
};

const save = async () => {
  //save to whatever name is currently typed in the input.
  //console.log("save");
  if (saveName.value !== "") {
    const content: litegraph.serializedLGraph<
      litegraph.SerializedLGraphNode<litegraph.LGraphNode>,
      [number, number, number, number, number, string],
      litegraph.SerializedLGraphGroup
    > = props.graph.serialize();

    let responsedata: string[] | null = await saveGraphName(
      saveName.value,
      JSON.stringify(content),
      `${backendurl}/graphs/save/${saveName.value}/`
    );
    if (responsedata) {
      filenames.value.push(responsedata);
    }
  }
};

const onLoadFileChange = (event: any) => {
  //console.log(event.target.value);
  selected = event.target.value;
};
const onSaveNameChange = (event: any) => {
  //console.log(event.target.value);
  saveName.value = event.target.value;
};
</script>
