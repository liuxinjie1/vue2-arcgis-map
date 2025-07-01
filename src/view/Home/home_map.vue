<template>
  <div class="home-map-container">
    <div
      id="map-tip"
      v-show="showTip && toolselected === 'query' && tipmsg"
      :style="{ left: tipPosition.x + 'px', top: tipPosition.y + 'px' }"
    >
      {{ tipmsg }}
    </div>
    <div class="maps">
      <div class="tool-list">
        <div
          :class="{ 'is-checked': tool.value === toolselected }"
          class="toolbt"
          v-for="tool in toollist"
          :key="tool.value"
          @click.stop="clickcheckbox(tool.value)"
        >
          <i :class="tool.icon"></i>
          <span class="tool-label">{{ tool.label }}</span>
        </div>
        <!-- <el-checkbox-group v-model="toolselected" size="mini" @change="checkboxchange">
          <el-checkbox-button
            v-for="tool in toollist"
            :label="tool.label"
            :key="tool.value"
            @click.stop="clickcheckbox(tool.label)"
          >
            <i :class="tool.icon"></i>
            {{ tool.label }}</el-checkbox-button
          >
        </el-checkbox-group> -->
      </div>
      <speciallayer
        v-show="toolselected === 'speciallayer'"
        @addordeletlayer="addordeletlayer"
        @closeservice="closeservice"
        @closeservicepoup="closeservicepoup"
        style="z-index: 1001"
      ></speciallayer>
      <location
        v-show="toolselected === 'location'"
        @closeservicepoup="closeservicepoup"
      ></location>
      <queryLayer
        ref="queryLayer"
        v-if="toolselected === 'query'"
        @deletelayer="addordeletlayer"
        @selectedlayer="addordeletlayer"
        @tipschange="tipschange"
        @updateform="updateform"
        @querylayerdestroy="querylayerdestroy"
        :fields="layerfields"
        style="z-index: 1001"
      ></queryLayer>
      <queryTable
        v-if="toolselected === 'query' && queryfrom.manner != '点击'"
        :columObj="columObj"
        :TableData="TableData"
        @current-change="currentchange"
      ></queryTable>
      <mapinfo
        @initCompleted="initCompleted"
        :queryUrl="queryUrl"
        ref="mapview"
        id="mapview"
      ></mapinfo>
    </div>
  </div>
</template>

<script>
// import { ForestVerificationList } from "@/api/foresmanagement";
import mapinfo from "../../components/mapplugin/mapinfo";
import speciallayer from "../../components/mapplugin/speciallayer"; // Uncomment if you want to use the special layer component
import location from "../../components/mapplugin/location"; // Uncomment if you want to use the location component
import queryLayer from "../../components/mapplugin/queryLayer"; // Uncomment if you want to use the query layer component
import queryTable from "../../components/mapplugin/queryTable"; // Uncomment if you want to use the query table component
export default {
  name: "ForestChiefSystemWebHomeMap",
  components: {
    mapinfo,
    speciallayer,
    location,
    queryLayer,
    queryTable,
  },
  watch: {
    // 监听 toolselected 的变化
    toolselected(newValue, oldValue) {
      // 这里可以添加逻辑来处理选中工具的变化
      // 例如，启用或禁用地图上的特定功能
    },
  },

  data() {
    return {
      toolselected: "",
      toollist: [
        {
          label: "查询",
          value: "query",
          icon: "iconfont icon-huizongtongji",
        },
        // {
        //   label: "点击",
        //   value: "clickquery",
        //   icon: "iconfont icon-shuxingchaxun",
        // },
        {
          label: "图层",
          value: "speciallayer",
          icon: "iconfont icon-zhuantituceng",
        },
        {
          label: "测距",
          value: "measure",
          icon: "iconfont icon-changdu",
        },
        {
          label: "测面",
          value: "measurearea",
          icon: "iconfont icon-mianji",
        },
        // {
        //   label: "定位",
        //   value: "location",
        //   icon: "iconfont icon-dingwei",
        // },
        {
        
          label: "卷帘",
          value: "swipe",
          icon: "iconfont icon-mianji",
        },
        {
          label: "清除",
          value: "clear",
          icon: "iconfont icon-shanchu",
        },
      ],
      esriMapControl: null, // 用于存储地图控制对象
      showTip: true, // 控制提示信息的显示\
      showTip1: false, // 控制提示信息的显示
      tipPosition: { x: 200, y: 70 }, // 提示信息的位置
      tipmsg: "", // 提示信息内容
      queryUrl: "", // 查询服务的URL
      columObj: {
        selection: false, // 是否显示选择框
        sorting: true, // 是否显示排序
        loading: false,
        rowheight: "60",
        columnData: [],
      },
      TableData: [], // 表格数据
      layerfields: "", // 图层字段信息
      queryfrom: {},
      polymerization: [], // 聚合数据
    };
  },

  async mounted() {
    // 鼠标移出地图隐藏提示
    document
      .getElementById("mapview")
      .addEventListener("mouseleave", this.falseshowtip);
    window.goinfo = this.goinfo.bind(this);
  },

  methods: {
    /**
     * 地图初始化完成的回调
     */
    async initCompleted(esriMapControl) {
      console.log("地图初始化完成");

      this.esriMapControl = esriMapControl; // 保存地图控制对象
      this.esriMapControl.zoomToPOI(117.0889, 36.2006, 5, 500); // 设置初始地图中心点和缩放级别
      // await this.ForestVerificationList(); // 获取聚合数据

      this.esriMapControl.mapView.on("pointer-move", (event) => {
        this.showTip = true; // 鼠标移动时显示提示信息
        // 监听地图点击事件
        this.tipPosition = { x: event.x + 185, y: event.y + 35 }; // 更新提示信息位置
      });
      // this.esriMapControl.polymerization(this.polymerization);
      // this.esriMapControl.drawArrowsss()
    },
    /**
     * 处理工具选中变化
     * @param {Array} value - 选中的工具列表
     */
    checkboxchange(value) {
      console.log("选中的工具:", value);
      // 这里可以添加逻辑来处理选中工具的变化
      // 例如，启用或禁用地图上的特定功能
    },
    clickcheckbox(value) {
      if (this.toolselected === value) {
        this.esriMapControl.polymerization(this.polymerization);
        this.toolselected = ""; // 如果再次点击同一个工具，则取消选中
        this.showTip1 = false; // 关闭提示信息
        return; // 直接返回，不执行后续逻辑
      }
      this.esriMapControl.polymerization([]); // 清除聚合数据
      this.toolselected = value; // 更新选中的工具
      if (
        this.toolselected != "measure" &&
        this.toolselected != "measurearea"
      ) {
        this.esriMapControl.destroyDraw(); // 如果选择的是查询工具，调用查询方法
      }
      if (this.toolselected === "measure") {
        this.esriMapControl.drawpolyline();
        this.toolselected = "";
      } else if (this.toolselected === "measurearea") {
        this.esriMapControl.areaMeasurement(); // 如果选择的是测面工具，调用测面方法
        this.toolselected = "";
      } else if (this.toolselected === "location") {
        // this.esriMapControl.location(); // 如果选择的是定位工具，调用定位方法
      } else if (this.toolselected === "clear") {
        this.esriMapControl.polymerization(this.polymerization);
        this.toolselected = ""; // 如果再次点击同一个工具，则取消选中
        this.showTip1 = false; // 关闭提示信息
        this.esriMapControl.cleardrawlayer(); // 如果选择的是清除工具，调用清除方法
      } else if (this.toolselected === "query") {
      } else if (this.toolselected === "speciallayer") {
        // this.esriMapControl.speciallayer(); // 如果选择的是图层工具，调用图层方法
      } else if (this.toolselected === "clickquery") {
        // this.tipmsg = `点击查询方式需要在地图上点击查询`;
        // this.esriMapControl.drawpoint(formval, (vals) => {
        //   this.tipmsg = ``; // 更新提示信息内容
        // });
      }else if (this.toolselected === "swipe") {
        this.esriMapControl.drawRollerShutterComparison(); // 如果选择的是卷帘工具，调用卷帘方法
      } 

      console.log("点击的工具:", value);
      // 这里可以添加逻辑来处理点击工具的事件
      // 例如，显示或隐藏特定的地图工具
    },
    // 添加或删除图层的处理函数
    addordeletlayer(val) {
      this.queryUrl = val.url + "/" + val.layerid; // 更新查询服务的URL
      this.esriMapControl.getfileds((fileds) => {
        this.columObj.columnData = [];
        fileds.forEach((item) => {
          this.columObj.columnData.push({
            text: true, // 是否显示文本
            prop: item, // 字段名称
            label: item || item, // 字段别名或名称
            width: "100", // 设置列宽
          });
        });
        this.layerfields = fileds.join(","); // 将字段信息转换为逗号分隔的字符串
        console.log("获取到的字段信息:", fileds); // 打印获取到的字段信息
      });
      this.esriMapControl.addordeletlayer(val);
    },
    // 关闭图层服务的处理函数
    closeservice() {
      this.esriMapControl.closeservice();
    },
    // 关闭服务弹出窗口的处理函数
    closeservicepoup() {
      this.toolselected = "";
    },
    // 鼠标移出地图隐藏提示信息
    falseshowtip() {
      console.log("鼠标移出地图，隐藏提示信息");
      this.showTip = false; // 隐藏提示信息
    },
    // 图层查询操作
    tipschange(val, type, formval) {
      if (type === "点击") {
        this.esriMapControl.drawpoint(formval, (vals) => {
          this.tipmsg = ``; // 更新提示信息内容
        });
      } else if (type === "拉框") {
        this.esriMapControl.drawRectangle(formval, (vals) => {
          this.tipmsg = ``; // 更新提示信息内容
          this.TableData = vals; // 更新表格数据
        });
      } else if (type === "多边形") {
        this.esriMapControl.drawPolygonQuer(formval, (vals) => {
          this.tipmsg = ``; // 更新提示信息内容
          this.TableData = vals; // 更新表格数据
        });
      } else if (type === "属性") {
        this.esriMapControl.queryByAttribute(formval, (vals) => {
          this.tipmsg = ``; // 更新提示信息内容
          this.TableData = vals; // 更新表格数据
        });
      } else {
        this.tipmsg = val; // 如果没有特定类型，直接使用传入的值
      }
      this.tipmsg = val; // 更新提示信息内容
    },
    // 处理表格行的当前选中事件
    currentchange(row) {
      console.log("当前选中行:", row); // 打印当前选中行的信息
      let data = { ...row };
      let geometry = row.geometry;
      delete data.geometry;
      this.esriMapControl.selectedGraphic(data, geometry);
    },
    // 更新查询表单数据
    updateform(val) {
      this.queryfrom = val; // 更新查询表单数据
    },
    // 清除查询图层数据
    querylayerdestroy() {
      this.TableData = []; // 清空表格数据
      this.columObj.columnData = []; // 清空列数据
      this.esriMapControl.drawGraphicalLayer.removeAll();
      this.esriMapControl.removedrawGraphicsLayermapindex();
      this.esriMapControl.mapView.popup.close();

      console.log(this.queryfrom);
    },
    //获取聚合数据
    async ForestVerificationList() {
      const userinfo = JSON.parse(localStorage.getItem("userInfo"));
      let para = {
        PageSize: 9999999,
        PageIndex: 1,
        xzqdm: userinfo.xzqdm,
        tbbsm: "",
        taskprogress: "",
        status: "",
        forestfarm_code: "",
        guid: "",
      };
      const res = await ForestVerificationList(para);
      if (res.code == 200) {
        this.polymerization = res.result; // 更新聚合数据
        // this.tipNumber.allcount = res.count;
      }
    },
    goinfo(guid) {
      debugger;
      this.$router.push({
        path: "evidencepattern",
        query: {
          guid: guid,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f0f0f0; /* Example background color */
  padding: 5px;
  box-sizing: border-box;
  #map-tip {
    position: fixed;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border-radius: 4px;
    pointer-events: none;
    font-size: 14px;
    z-index: 10;
  }
  /* Additional styles can be added here */
  .maps {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: #fff; /* Example background color for the map */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Optional shadow for depth */
    border-radius: 8px; /* Optional rounded corners */
    overflow: hidden; /* Ensures no overflow from the map */
    .tool-list {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 111;
      display: flex;
      flex-direction: row;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.13);
      padding: 8px 14px;
      gap: 6px;
      border: 1px solid #e6eaf0;
    }
    .toolbt {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 10px;
      background: transparent;
      cursor: pointer;
      font-size: 15px;
      color: #333;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      position: relative;
      .iconfont {
        font-size: 22px;
        margin-bottom: 2px;
        color: #409eff;
        transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .tool-label {
        font-size: 12px;
        color: #333;
        transition: color 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        letter-spacing: 0.5px;
      }
      &:hover {
        background: #e6f7ff;
        transform: scale(1.08);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        .iconfont,
        .tool-label {
          color: #007aff;
        }
      }
    }
    .is-checked {
      background: linear-gradient(135deg, #409eff 60%, #66b1ff 100%);
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.18);
      border: 2px solid #fff;
      .iconfont,
      .tool-label {
        color: #fff !important;
        text-shadow: 0 1px 4px rgba(64, 158, 255, 0.18);
      }
    }
    .is-checked:hover {
      background: linear-gradient(135deg, #53b2ff 70%, #7cc8ff 100%);
      box-shadow: 0 6px 24px 2px rgba(64, 158, 255, 0.28), 0 0 8px 2px #b3e0ff;
      border: 2px solid #53b2ff;
      transform: scale(1.12);
      .iconfont,
      .tool-label {
        color: #fff !important;
        text-shadow: 0 2px 8px #53b2ff;
      }
    }
  }
}
@keyframes fadeColor {
  0% {
    background-color: white;
  }
  100% {
    background-color: #409eff;
  }
}
</style>