<template>
  <div id="app"></div>
</template>

<script>
import {Card} from "components/Card.vue";

export default {
  name: "App",
  components: {Card},
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  background: rgba(1, 31, 53, 1);
  min-height: 100vh;
  width: 100vw;
}
</style>
