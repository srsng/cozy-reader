<template>
  <div>
    <AppTitleBar :appTitle="appTitle"/>
    <router-view @content-change="handleContentChange"/>
    <FooterBar />
  </div>
</template>

<script>
import AppTitleBar from "@/components/titlebar/AppTitleBar.vue";
import FooterBar from "@/components/footerbar/FooterBar.vue";
// import initAppWindow from "@/components/titlebar/index.js";

export default {
  name: "App",
  components: {
    AppTitleBar,
    FooterBar,
  },
  data() {
    return {
      // appWindow: null,
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
        this.appTitle = bookTitle ? bookTitle.textContent : "cozy reader";
      }
    },
  },
  created() { },
  mounted() {
    // console.log("App mounted");
  },
  methods: {
    handleContentChange() {
      console.log("content change");
    },

  }
};
</script>

<style></style>
