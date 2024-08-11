<template>
  <AppTitleBar />
  <div>
    <router-view />
  </div>
</template>

<script>
import AppTitleBar from "@/components/titlebar/AppTitleBar.vue";
import initAppWindow from "@/components/titlebar/index.js";

export default {
  name: "App",
  components: {
    AppTitleBar,
  },
  data() {
    return {
      appWindow: null,
    };
  },
  methods: {},
  created() {
    
  },
  mounted() {
    // console.log("App mounted");
    this.appWindow = initAppWindow();
  },
};
</script>

<style></style>
