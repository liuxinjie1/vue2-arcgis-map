<template>
  <div class="galandanalysebody">
    <el-card class="box-card">
      <div class="titleclass">
        <div class="left">
          <img src="@/assets/image/ygfx_icon1.png" alt="" />
          <span>矿产保护占压分析</span>
        </div>
        <i class="el-icon-close"></i>
      </div>
      <div class="btclass">
        <el-button
          type="primary"
          icon="el-icon-edit"
          size="small"
          @click="drawgeometry"
          >绘制要素</el-button
        ><el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="querydata"
          >查询分析结果</el-button
        >
      </div>
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        :header-cell-style="tableheaderstyle"
      >
        <el-table-column
          prop="name"
          label="分析类型名称"
          min-width="120"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="address"
          width="100"
          label="显示/隐藏"
          align="center"
        >
          <template slot-scope="scope">
            <i
              v-if="scope.row.isshow"
              @click="showlayer(scope.row)"
              class="iconfont icon-yanjing_xianshi_o"
            ></i>
            <i
              v-if="!scope.row.isshow"
              @click="showlayer(scope.row)"
              class="iconfont icon-yanjing_yincang_o"
            ></i>
          </template>
        </el-table-column>
      </el-table>
      <div class="titleclass" v-show="tabledata2.length>0">
        <div class="left">
          <img src="@/assets/image/ygfx_icon1.png" alt="" />
          <span>占压分析结果</span>
        </div>
      </div>
      <el-table
        ref="multipleTable"
        :data="tabledata2"
        tooltip-effect="dark"
        style="width: 100%"
        v-show="tabledata2.length>0"
        :header-cell-style="tableheaderstyle"
      >
        <el-table-column
          prop="DLMC"
          label="土地类型"
          min-width="120"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="graphicarea"
          width="100"
          label="面积"
          align="center"
        >
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "MiningapprovalWebGlandanalyse",

  data() {
    return {
      oldselectdata: [],
    };
  },
  watch: {
    tabledata2: {
      handler(newval, oldval) {
        debugger;
      },
    },
  },
  props: {
    tableData: {
      type: Array,
      default: [
        {
          date: "2024-08-06 16:56:56",
          name: "2022年国土变更调查湿地",
          isshow: true,
          url: "http://60.204.220.243:6080/arcgis/rest/services/DPXZ/MapServer",
          layerid: "0",
        },
        {
          date: "2024-08-06 16:56:56",
          name: "2022年永久基本农田",
          isshow: true,
          url: "http://60.204.220.243:6080/arcgis/rest/services/DPXZ/MapServer",
          layerid: "0",
        },
        {
          date: "2024-08-06 16:56:56",
          name: "2024年永久基本农田",
          isshow: true,
          url: "http://60.204.220.243:6080/arcgis/rest/services/DPXZ/MapServer",
          layerid: "0",
        },
        {
          date: "2024-08-06 16:56:56",
          name: "2022年生态保护红线",
          isshow: true,
          url: "http://60.204.220.243:6080/arcgis/rest/services/DPXZ/MapServer",
          layerid: "1",
        },
      ],
    },
    tabledata2: {
      type: Array,
      default: [],
    },
  },

  mounted() {},

  methods: {
    handleSelectionChange(eve) {
      this.oldselectdata = eve;
    },
    tableheaderstyle() {
      return { background: "rgba(0, 0, 0, 0.02)", color: "black" };
    },
    drawgeometry() {
      this.$emit("drawgeometry");
    },
    querydata() {
      this.$emit("querydata");
    },
    showlayer(eve) {
      if (eve.isshow) {
        this.$emit("showlayer", eve);
      } else {
        this.$emit("showlayer", eve);
      }
      eve.isshow = !eve.isshow;
    },
  },
};
</script>

<style lang="scss" scoped>
// @import "@/components/style/glandanalyse.scss";
</style>
