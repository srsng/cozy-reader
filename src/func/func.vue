<script>
export default {
  name: "Func",
  components: {},
  methods: {
    curRouterIs(name) {
      return this.$route.name === name;
    },
  },
}
</script>