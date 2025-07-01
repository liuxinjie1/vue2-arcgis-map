<template>
  <div id="app">
    <router-view />
    <!-- <AIChatAssistant v-if="isLoggedIn" /> -->
    <AIChatAssistant v-if="showAssistant" />
  </div>
</template>

<script>
import * as signalR from "@microsoft/signalr";

export default {
  name: "App",
  components: {},
  data() {
    return {
      // isLoggedIn: false,
      showAssistant: false
    }
  },
  watch: {
    // 监听本地存储变化
    // '$store.state.user': {
    //   handler(newVal) {
    //     this.checkLoginStatus();
    //   },
    //   deep: true
    // },
    '$route': {
      immediate: true,
      handler(to) {
        // 在非登录页面显示AI助手
        this.showAssistant = to.path !== '/login';
      }
    }
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('userInfo');
    }
  },
  mounted() {
    // 初始检查登录状态
    // this.checkLoginStatus();

    // // 监听登录事件
    // this.$bus.$on('login-success', () => {
    //   this.checkLoginStatus();
    // });
  },
  beforeDestroy() {
    // 移除事件监听
    // this.$bus.$off('login-success');
  }
};
</script>

<style lang="scss" scoped>
.popoverclass {
  ::v-deep .el-radio-group {
    display: flex;
  }
}

</style>
