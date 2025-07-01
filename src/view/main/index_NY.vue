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
      <div class="title">田长制</div>
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
              id: "001001",
              name: "巡田问题",
              icon: "iconfont icon-shouye",
              icontype: "font",
            },
            children: [],
            path: "/problemlist",
          },
          {
            meta: {
              id: "001009",
              name: "图斑管理",
              icon: "iconfont icon-yonghuguanli",
              icontype: "font",
            },
            children: [
              {
                meta: {
                  id: "001009002",
                  name: "举证图斑",
                  icontype: "font",
                },
                children: [],
                path: "/evidencepattern",
              },
              {
                meta: {
                  id: "001009001",
                  name: "图斑下发",
                  icontype: "font",
                },
                children: [],
                path: "/polygonIssued",
              },
            ],
            path: "",
          },
          {
            meta: {
              id: "001010",
              name: "业务考勤",
              icon: "iconfont icon-yonghuguanli",
              icontype: "font",
            },
            children: [],
            path: "/personnelattendance",
          },
          {
            meta: {
              id: "001003",
              name: "巡田记录",
              icon: "iconfont icon-zonghechaxun",
              icontype: "font",
            },
            children: [],
            path: "/patrolfieldlog",
          },
          {
            meta: {
              id: "001004",
              name: "指挥调度",
              icon: "iconfont icon-huizongtongji",
              icontype: "font",
            },
            children: [],
            path: "/commandDispatch",
          },
          {
            meta: {
              id: "001014",
              name: "指挥调度1",
              icon: "iconfont icon-huizongtongji",
              icontype: "font",
            },
            children: [],
            path: "/screenstatistics",
          },

          {
            meta: {
              id: "001015",
              name: "指挥调度2",
              icon: "iconfont icon-huizongtongji",
              icontype: "font",
            },
            children: [],
            path: "/commandDispatchLZZ",
          },

          {
            meta: {
              id: "001006",
              name: "统计分析",
              icon: "iconfont icon-zuzhijiagou",
              icontype: "font",
            },
            children: [],
            path: "/statistics",
          },
          {
            meta: {
              id: "001007",
              name: "宣传教育",
              icon: "iconfont icon-xitongrizhi",
              icontype: "font",
            },
            children: [
              {
                meta: {
                  id: "001007001",
                  name: "宣传教育查看",
                  icontype: "font",
                },
                children: [],
                path: "/articleinfo",
              },
              {
                meta: {
                  id: "001007002",
                  name: "宣传教育发布",
                  icontype: "font",
                },
                children: [],
                path: "/articleList",
              },
            ],
            path: "",
          },

          // {
          //   meta: {
          //     id: "001010",
          //     name: "田长录入",
          //     icon: "iconfont icon-yonghuguanli",
          //     icontype: "font",
          //   },
          //   children: [],
          //   path: "/appusermanage",
          // },
          {
            meta: {
              id: "001005",
              name: "用户管理",
              icon: "iconfont icon-yonghuguanli",
              icontype: "font",
            },
            children: [
              {
                meta: {
                  id: "001005001",
                  name: "Web用户管理",
                  icontype: "font",
                },
                children: [],
                path: "/webusermanage",
              },
              {
                meta: {
                  id: "001005002",
                  name: "App用户管理",
                  icontype: "font",
                },
                children: [],
                path: "/appusermanage",
              },
            ],
            path: "/usermanage",
          },
          // {
          //   meta: {
          //     id: "001008",
          //     name: "视频通话",
          //     icon: "iconfont icon-zuzhijiagou",
          //     icontype: "font",
          //   },
          //   path: "/videocall",
          // },
          // {
          //   meta: {
          //     id: "001011",
          //     name: "巡田二维码",
          //     icon: "iconfont icon-zuzhijiagou",
          //     icontype: "font",
          //   },
          //   path: "/qrcodemanager",
          // },
          // {
          //   meta: {
          //     id: "001012",
          //     name: "健康报告",
          //     icon: "iconfont icon-zuzhijiagou",
          //     icontype: "font",
          //   },
          //   path: "/qrranking",
          // }
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
