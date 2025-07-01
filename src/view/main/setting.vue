<template>
  <div id="main_id" style="width: 100%; height: 100%">
    <div class="main_header">
      <div class="img_name">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <el-avatar :size="40" :src="circleUrl"></el-avatar>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-edit">修改密码</el-dropdown-item>
            <el-dropdown-item
              icon="el-icon-switch-button"
              @click.native="logout"
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <span class="name">{{ userinfo.username }}</span>
      </div>
      <div class="title">新泰市森林资源督察执法平台</div>
      <div></div>
      <!-- <div class="user_info">
        <i class="el-icon-bell"></i>
        <i class="el-icon-user" style="margin-left: 30px"></i>
        <span style="margin-left: 12px">管理员</span>
      </div> -->
    </div>
    <div class="main_content">
      <div class="menu">
        <el-menu
          class="el-menu-vertical-demo"
          background-color="rgb(45, 140, 240)"
          text-color="#fff"
          active-text-color="#fff"
          :menu-trigger="Menuparam.menuTrigger"
          :mode="Menuparam.mode"
          :default-active="defaultmenu"
        >
          <SubMenu
            :subMenuList="Menuparam.MenuList"
            :mode="Menuparam.mode"
          ></SubMenu>
        </el-menu>
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { LogOut } from "../../utils/utils";
import SubMenu from "../../components/menu/index";

export default {
  name: "WebIndex",
  components: {
    SubMenu,
  },

  data() {
    return {
      defaultmenu: "",
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      Menuparam: {
        MenuList: [
          {
            meta: {
              id: "0010012",
              name: "系统管理",
              icon: "iconfont icon-yonghuguanli",
              icontype: "font",
            },
            children: [
              {
                meta: {
                  id: "0010012001",
                  name: "图层管理",
                  icontype: "font",
                },
                children: [],
                path: "/layermanage",
                type: "1",
              },
            ],
          },
        ],
        mode: "vertical",
        menuTrigger: "click",
      },
      userinfo: {},
    };
  },

  mounted() {
    this.userinfo = JSON.parse(localStorage.getItem("userInfo"));
  },
  beforeDestroy() {},
  Updated() {},

  methods: {
    logout() {
      LogOut();
    },
  },
};
</script>

<style lang="scss" scoped>
.main_header {
  width: 100%;
  height: 64px;
  background: -webkit-linear-gradient(right, #bcdafa, #2d8cf0);
  position: relative;
  display: flex;

  .img_name {
    display: flex;
    align-items: center;
    margin-left: 10px;
    float: left;
    z-index: 1;

    span {
      font-size: 16px;
      color: white;
      cursor: pointer;
    }

    .name {
      padding-left: 10px;
      cursor: default;
    }
  }

  .title {
    float: left;
    width: 100%;
    font-size: 26px;
    text-align: center;
    color: white;
    position: absolute;
    left: 0;
    height: 100%;
    line-height: 64px;
  }

  .user_info {
    width: 10%;
    display: flex;

    i {
      color: white;
      font-size: 24px;
    }

    span {
      color: white;
      font-size: 16px;
    }
  }
}

.main_content {
  height: calc(100% - 64px);
  width: 100%;
  display: flex;
  justify-content: start;

  .menu {
    width: 180px;
    height: 100%;
    background-color: rgb(45, 140, 240);
    overflow-y: auto;
  }

  .menu::-webkit-scrollbar {
    display: none;
  }

  .content {
    position: relative;
    width: calc(100% - 180px);
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
  }
}

::v-deep .el-menu {
  border: none;
}

::v-deep .el-menu-item.is-active {
  background-color: #5cadff !important;
  /* 使用 !important 来确保覆盖其他样式 */
  color: inherit;
  /* 继承父元素的文字颜色，如果父元素也没有变化，可能需要进一步设置 */
  /* 如果还有其他样式变化，如边框，也需要相应地设置 */
  border-color: transparent !important;
  /* 假设有边框颜色变化 */
}

::v-deep .el-menu-item:hover {
  background-color: #5cadff !important;
  /* 使用 !important 来确保覆盖其他样式 */
  //color: #2569D8 !important;
  /* 继承父元素的文字颜色，如果父元素也没有变化，可能需要进一步设置 */
  /* 如果还有其他样式变化，如边框，也需要相应地设置 */
  border-color: transparent !important;
  /* 假设有边框颜色变化 */
}

::v-deep .el-menu-item.is-active,
.el-menu-item:hover,
.el-submenu__title:hover {
  background-color: #5cadff !important;
}

::v-deep .el-submenu__title:hover {
  background-color: #5cadff !important;
}
</style>
