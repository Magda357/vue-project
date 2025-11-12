<template>
  <div id="app">
    <AppHeader />

    <BaseCard />
  </div>
</template>

<script>
import BaseCard from "./components/BaseCard.vue";
import {stockService} from "./services/stockService";
import AppHeader from "./components/AppHeader.vue";
export default {
  name: "App",
  components: {AppHeader, BaseCard},

  async created() {
    this.data = await stockService.fetchData("$AAPL");
    console.log("loaded data:", this.data);
  },
};
</script>

<style>
@font-face {
  font-family: Rubik;
  src: url("@/assets/fonts/Rubik-Italic-VariableFont_wght.ttf") format("ttf");
  src: url("@/assets/fonts/Rubik-VariableFont_wght.ttf") format("ttf");
  font-weight: normal;
  font-style: normal;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Rubik, sans-serif;
}
#app {
  background: rgba(1, 31, 53, 1);
  min-height: 100vh;
  width: 100vw;
}
</style>
