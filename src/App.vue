<template>
  <AppTitleBar />
  <router-view class="my-8" />
  <FooterBar />
</template>

<script>
import AppTitleBar from "@/components/titlebar/AppTitleBar.vue";
import FooterBar from "@/components/footerbar/FooterBar.vue";
import initAppWindow from "@/components/titlebar/index.js";

export default {
  name: "App",
  components: {
    AppTitleBar,
    FooterBar,
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
