<template>
  <div>
    <AppTitleBar :appTitle="this.appTitle"/>
    <router-view />
    <FooterBar />
  </div>
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
      routerIndex: 0,
      appTitle: "cozy reader",
    };
  },
  watch: {
    $route(to) {
      if (to.name === "Home") {
        this.appTitle = "cozy reader";
      } else if (to.name === "BookReader") {
        const bookTitle = document.getElementById("book-title");
        this.appTitle = bookTitle ? bookTitle.innerText : "cozy reader";
      }
    },
  },
  methods: {},
    created() { },
    mounted() {
      // console.log("App mounted");
      this.appWindow = initAppWindow();
    },
};
</script>

<style></style>
