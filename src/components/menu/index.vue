<template>
  <div class="box fx_1" :class="mode == 'vertical' ? 'fx_col' : 'fx'">
    <template v-for="item in subMenuList">
      <el-submenu
        v-if="item.children && item.children.length > 0"
        :key="item.meta.id"
        :index="item.meta.id + ''"
      >
        <template slot="title">
          <!-- <i :class="item.meta.icon && item.meta.icon"></i> -->
          <img
            v-if="item.meta.icontype == 'img'"
            :src="item.meta.icon"
            style="width: 20px; height: 20px; padding-right: 5px"
          />
          <i
            v-if="item.meta.icontype == 'font'"
            style="padding-right: 5px; color: #fff"
            :class="item.meta.icon && item.meta.icon"
          ></i>
          <span class="spancls">{{ item.meta.name }}</span>
        </template>
        <SubMenu :subMenuList="item.children" />
      </el-submenu>
      <el-menu-item
        v-else
        @click="clickmenu(item)"
        :key="item.meta.id"
        :index="item.meta.id"
        :route="{ path: item.path, param: { type: '0' } }"
      >
        <template slot="title">
          <!-- <i :class="item.meta.icon && item.meta.icon"></i> -->
          <img
            v-if="item.meta.icontype == 'img'"
            :src="item.meta.icon"
            style="width: 20px; height: 20px; padding-right: 5px"
          />
          <i
            v-if="item.meta.icontype == 'font'"
            style="padding-right: 5px; color: #fff"
            :class="item.meta.icon && item.meta.icon"
          ></i>

          <span class="spancls">{{ item.meta.name }}</span>
        </template>
      </el-menu-item>
    </template>
  </div>
</template>

<script>
import { SubMenu } from "../menu/index";

export default {
  name: "SubMenu",
  components: {
    SubMenu,
  },
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

  methods: {
    menu_close(ev) {
      this.isclose = ev;
    },
    clickmenu(eve) {
      //console.log(this.$route.path);
      if (eve.path == this.$route.path) {
        return;
      }

      if (eve.path.indexOf("http") == 0) {
        window.top.location.href = eve.path;
        return;
      }
      let path = "";
      if (eve.para) {
        if (eve.path.indexOf("/") == 0) {
          path = eve.path.substring(1, eve.path.length);
        }
      }
      if (eve.type == "1") {
        this.$router.push({
          path: path ? path : eve.path,
          params: eve.para ? eve.para : null,
        });
      } else {
        window.open(eve.path);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
}
.fx_col {
  display: flex;
  flex-direction: column;
}
.fx {
  display: flex;
}

.spancls {
  font-size: 18px;
  display: inline-block;
  width: 80px;
  text-align: left;
}

::v-deep .box .el-menu-item.is-active,
.el-menu-item:hover,
.el-submenu__title:hover {
  background-color: #5cadff !important;
}
::v-deep .box .el-submenu__title:hover {
  background-color: #5cadff !important;
}
::v-deep .el-submenu__title .el-submenu__icon-arrow {
  color: white !important;
}
</style>
