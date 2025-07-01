<template>
  <div class="box"></div>
</template>

<script>
export default {
  name: "regionselectionbox",
  components: {},
  props: {
    subMenuList: {
      //接收到的菜单信息
      type: Array,
      default: [],
    },
    authority: {
      //填报权限 0 1不展示
      type: Number,
      default: 0,
    },
    mode: {
      //菜单 水平  垂直
      type: String,
      default: "vertical",
    },
  },
  data() {
    return {
      list: [],
    };
  },

  mounted() {},

  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
</style>
