<template>
  <div class="workflow">
    <h1>Workflow</h1>
    <p>Here you do workflows.</p>
    <div style="width: 50%; height: 50%;" id="litegraph">
      <LiteGraph/>
    </div>
  </div>
</template>

<script>
  import LiteGraph from "@/components/LiteGraph";

  export default {
    name: "WorkflowView",
    components: {
      LiteGraph
    }
  };
</script>

<style>
html,
body {
  height: 100%;
  position: relative;
  margin: 0;
}
</style>
