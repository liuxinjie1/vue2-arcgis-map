<template>
  <div class="speciallayerbody">
    <div class="head">
      <span>专题图层</span>
      <div class="center">
        <!-- <el-checkbox size="mini" v-model="checked"></el-checkbox>
        <span>要素识别</span> -->
      </div>
      <span @click="closeservice" >[关闭所有图层]</span>
      <i @click="closepoup" class="el-icon-d-arrow-right"></i>
    </div>
    <div class="content">
      <el-collapse>
        <el-collapse-item v-for="(item, index) in layers" :key="index">
          <template slot="title">
            {{ item.label }}（{{ item.layer.length }}）
          </template>
          <el-checkbox-group v-model="checkedlayer">
            <el-checkbox
              v-for="layer in item.layer"
              :label="layer.id"
              :key="layer.id"
              @change="handlecheckeChange(layer)"
              >{{ layer.label }}</el-checkbox
            >
          </el-checkbox-group>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
export default {
  name: "MiningapprovalWebLayer",

  data() {
    return {
      checkedlayer: [],
      layers: [
        {
          id: "1",
          label: "林业专题",
          layer: [
            {
              id: "001001",
              label: "林业-新泰自然保护地",
              icon: "el-icon-tree",
              maptype: "MapImageLayer",
              url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSZRBHD/MapServer",
              layerid: "0",
            },
            {
              id: "001002",
              label: "林业-新泰公益林",
              maptype: "MapImageLayer",
              icon: "el-icon-leaf",
              url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSGYL/MapServer",
              layerid: "0",
            },
            {
              id: "001003",
              label: "林业-新泰林地一张图",
              maptype: "MapImageLayer",
              icon: "el-icon-mountain",
              url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSYZT/MapServer",
              layerid: "0",
            },
            {
              id: "001004",
              label: "林业-新泰2024现状",
              maptype: "MapImageLayer",
              icon: "el-icon-water-cup",
              url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_2024XTSXZ/MapServer",
              layerid: "0",
            },
          ],
        },
        // {
        //   id: "1",
        //   label: "自然资源专题",
        //   layer: [
        //     {
        //       id: "001001",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_sds/MapServer",
        //       layerid: "0",
        //       label: "十大山",
        //     },
        //     {
        //       id: "001002",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_zdlc/MapServer",
        //       label: "重点林区",
        //       layerid: "1",
        //     },
        //     {
        //       id: "001003",
        //       url: "http://1.94:6080/arcgis/rest/services/DPXZ/MapServer",
        //       layerid: "0",
        //       label: "东平现状",
        //     },
        //     {
        //       id: "001004",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_zdhy/MapServer",
        //       layerid: "0",
        //       label: "墓地",
        //     },
        //     {
        //       id: "001005",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_zdhy/MapServer",
        //       layerid: "1",
        //       label: "高危企业",
        //     },
        //     {
        //       id: "001006",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_zdhy/MapServer",
        //       layerid: "3",
        //       label: "公园景区",
        //     },
        //   ],
        // },
        // {
        //   id: "2",
        //   label: "区划界限",
        //   layer: [
        //     {
        //       id: "002001",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcss/MapServer",
        //       layerid: "2",
        //       label: "防火通道",
        //     },
        //     {
        //       id: "002002",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcss/MapServer",
        //       label: "其他防火基础设施",
        //       layerid: "3",
        //     },
        //     {
        //       id: "002003",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcyjss/MapServer",
        //       layerid: "0",
        //       label: "瞭望设施",
        //     },
        //     {
        //       id: "002004",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcyjss/MapServer",
        //       layerid: "1",
        //       label: "视频监控设施",
        //     },
        //     {
        //       id: "002005",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcyjss/MapServer",
        //       layerid: "2",
        //       label: "卡口",
        //     },
        //     {
        //       id: "002006",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcyjss/MapServer",
        //       layerid: "3",
        //       label: "护林房",
        //     },
        //   ],
        // },
        // {
        //   id: "3",
        //   label: "山东自由贸易试验区",
        //   layer: [
        //     {
        //       id: "003001",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcss/MapServer",
        //       layerid: "1",
        //       label: "水源地",
        //     },
        //     {
        //       id: "003002",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_jcss/MapServer",
        //       label: "物资储备库",
        //       layerid: "0",
        //     },
        //     {
        //       id: "003003",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_hyzgbm/MapServer",
        //       layerid: "0",
        //       label: "主管部门",
        //     },
        //     {
        //       id: "003004",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_fmhdw/MapServer",
        //       layerid: "0",
        //       label: "防灭火队伍",
        //     },
        //     {
        //       id: "003005",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_zdhy/MapServer",
        //       layerid: "4",
        //       label: "其他火源点",
        //     },
        //     {
        //       id: "003006",
        //       url: "https://service.sdmap.gov.cn:8091/arcgis/rest/services/QTYW/slfh_zdhy/MapServer",
        //       layerid: "2",
        //       label: "加油站",
        //     },
        //   ],
        // },
      ],
      checked: false,
    };
  },

  mounted() {},

  methods: {
    handlecheckeChange(eve) {
      const index = this.checkedlayer.findIndex((item) => item === eve.id);
      if (index < 0) {
        console.log("取消选中");
        eve["isshow"] = false;
      } else {
        console.log("显示图层");
        eve["isshow"] = true;
      }

      this.$emit("addordeletlayer", eve);
    },
    closeservice() {
      this.$emit("closeservice");
      this.checkedlayer = [];
    },
    closepoup() {
      this.$emit("closeservicepoup");
    },
  },
};
</script>
<style lang="scss" scoped>
// @import "@/components/style/speciallayer.scss";
@import "@/components/style/speciallayer.scss";
</style>
