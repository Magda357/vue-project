<template>
  <div id="app">
    <BaseCard />
  </div>
</template>

<script>
import BaseCard from "./components/BaseCard.vue";
import {stockService} from "@/services/stockService";
export default {
  name: "App",
  components: {BaseCard},

  async created() {
    this.data = await stockService.fetchData("$AAPL");
    console.log("loaded data:", this.data);
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  background: rgba(1, 31, 53, 1);
  min-height: 100vh;
  width: 100vw;
}
</style>
