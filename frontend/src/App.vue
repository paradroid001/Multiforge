<template>
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link :to="{name: 'Forges'}">Forges</router-link>
      <router-link :to="{name: 'Tools'}">Tools</router-link>
      <router-link :to="{name: 'Workflows'}">Workflows</router-link>
    </div>
    <button @click="redirect">Redirect</button>
    <button @click="back">Go Back</button>
    <button @click="forward">Go Forward</button>
    <router-view />
    
  
  
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
  },
  setup() {
    //See: https://router.vuejs.org/guide/advanced/composition-api.html#accessing-the-router-and-current-route-inside-setup
    const router = useRouter();
    ///const route = useRoute();

    const redirect = () => {
        router.push( {name: "home"} );
    };

    const back = () => {
        router.go(-1);
    };
    
    const forward = () => {
        router.go(1);
    }

    return {redirect, back, forward}; //, tools, handleClick, order}
  }
});
</script>

<style>
  header {
    text-align: center;
  }
  header .order {
    margin-top: 20px;
  }
  button {
    margin: 0 10px;
    color: #1195c9;
    border: 3px solid #1195c9;
    background: #d5f0ff;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  header .title {
    /*display: flex; /* sit next to image etc */
    justify-content: center;
  }
  header img {
    width: 60px;
    margin-right: 20px;
  }
  header h1 {
    font-size: 3em;
  }

  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;
    padding: 10px;
    border-radius: 4px;
  }

    #nav a.router-link-exact-active {
    color: white;
    background: crimson;
  }

  /*
  button {
    margin: 0 10px;
    padding: 10px;
    border: none;
    border-radius: 4px;
  }
  */

</style>
