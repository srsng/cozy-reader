<template>
  <div>
    <AppTitleBar/>
    <router-view/>
    <FooterBar />
  </div>
</template>

<script>
import AppTitleBar from "@/components/titlebar/AppTitleBar.vue";
import FooterBar from "@/components/footerbar/FooterBar.vue";

export default {
  name: "App",
  components: {
    AppTitleBar,
    FooterBar,
  },

};
</script>

<style></style>
