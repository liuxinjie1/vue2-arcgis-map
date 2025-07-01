<template>
  <div style="width: 100%; height: 100%; position: relative">
    <esri-map
      ref="mapControl"
      @initCompleted="initCompleted"
      style="width: 100%; height: 100%"
      @getShapearea="getShapearea"
    ></esri-map>
    <el-amap-search-box
      class="search-box"
      v-if="isShowamapsearch"
      :search-option="searchOption"
      :on-search-result="onSearchResult"
    ></el-amap-search-box>
    <transition name="el-zoom-in-left">
      <gland-analyse
        @querydata="querylayerdata"
        @showlayer="addordeletlayer"
        @drawgeometry="querydrawPolygon"
        :tabledata2="analysedata"
        v-show="!isshowspeciallayer"
      ></gland-analyse>
    </transition>
    <transition name="el-zoom-in-top">
      <special-layer
        @addordeletlayer="addordeletlayer"
        @closeservice="closeservice"
        @closeservicepoup="showlayer"
        v-show="isshowspeciallayer"
      ></special-layer>
    </transition>
    <div class="locationHtml">
      <el-tooltip content="测距" placement="bottom" effect="light">
        <i
          class="iconfont icon-changdu"
          style="font-size: 20px; color: #7d8592"
          @click="drowLine"
        ></i>
      </el-tooltip>
      <el-tooltip content="面积测量" placement="bottom" effect="light">
        <i
          class="iconfont icon-mianji"
          style="font-size: 20px; color: #7d8592"
          @click="areaMeasurement"
        ></i>
      </el-tooltip>
      <el-tooltip content="图形绘制" placement="bottom" effect="light">
        <i
          class="iconfont icon-tuxinghuizhi"
          style="font-size: 20px; color: #7d8592"
          @click="drawPolygon"
        ></i>
      </el-tooltip>
      <el-tooltip content="坐标定位" placement="bottom" effect="light">
        <i
          class="iconfont icon-dingwei"
          style="font-size: 20px; color: #7d8592"
        ></i>
      </el-tooltip>
      <el-tooltip content="专题图层" placement="bottom" effect="light">
        <i
          class="iconfont icon-zhuantituceng"
          style="font-size: 20px; color: #7d8592"
          @click="showlayer"
        ></i>
      </el-tooltip>
      <el-tooltip content="压盖分析" placement="bottom" effect="light">
        <i
          class="iconfont icon-yagaifenxi"
          style="font-size: 20px; color: #7d8592"
        ></i>
      </el-tooltip>

      <el-tooltip content="全图" placement="bottom" effect="light">
        <i
          class="iconfont icon-quantu"
          style="font-size: 20px; color: #7d8592"
        ></i>
      </el-tooltip>

      <el-tooltip content="删除" placement="bottom" effect="light">
        <i
          class="iconfont icon-shanchu"
          style="font-size: 20px; color: #7d8592"
          @click="deletelayer"
        ></i>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import EsriMap from "../mapplugin/index.vue";
import speciallayer from "../mapplugin/speciallayer";
import glandanalyse from "../mapplugin/glandanalyse";
var PI = 3.1415926535897932384626;
var PA = 6378245.0;
var PE = 0.00669342162296594323;
export default {
  components: {
    "esri-map": EsriMap,
    "gland-analyse": glandanalyse,
    "special-layer": speciallayer,
  },
  // props: {
  //   geometry: {
  //     required: true,
  //   },
  // },
  data() {
    return {
      isShowamapsearch: true, // 地图搜索查询按钮
      searchOption: {
        city: "",
        citylimit: true,
      },
      mapControl: null,
      mapView: null,
      drawgeometry: null,
      redrawingLayer: null,
      Locationgeometry: null,
      area: 0,
      isshowspeciallayer: false,
      servicelayers: [],
      geometry: null,
      analysedata: [],
      loading: null,
    };
  },
  mounted() {},
  methods: {
    drawGraphicalLocation() {
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: this.geometry.rings,
        spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
      });
      this.Locationgeometry = this.geometry.rings;
      var graphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // casts as SimpleFillSymbol
          color: [255, 255, 0, 0],
          style: "solid",
          outline: {
            // casts as SimpleLineSymbol
            color: [255, 255, 0],
            width: 2,
          },
        },
      });
      if (this.mapView.graphics._items.length > 0) {
        this.mapView.graphics._items.forEach((element) => {
          this.mapView.graphics.remove(element);
        });
      }

      this.mapView.graphics.add(graphic);
      // 根据图形的范围调整地图视图
      // this.mapView.extent = graphic.geometry.extent;

      // 设置指定的缩放级别
      //this.mapView.zoom = 10;
      this.zoomTo(graphic.geometry.extent);
    },
    graphicPositioning() {
      if (this.drawgeometry != null) {
        this.zoomTo(this.drawgeometry.extent, 3000);
      }
    },
    //增加图层并且在该图层绘制图形
    drawPolygon() {
      // this.$refs.mapControl.addLayer(this.redrawingLayer);
      this.$refs.mapControl.drawPolygon(this.redrawingLayer);
    },
    //压盖分析查询绘制
    querydrawPolygon() {
      this.$refs.mapControl.removedraw();
      this.geometry = this.$refs.mapControl.drawPolygon(this.redrawingLayer);
    },

    //增加图层并且在该图层绘制图形
    areaMeasurement() {
      this.$refs.mapControl.areaMeasurement(this.redrawingLayer);
    },
    //获取所绘制图形面积
    getShapearea(geometry) {
      this.drawgeometry = geometry;
      this.$emit(
        "getShapearea",
        Math.round(Math.abs(this.calcatArea(geometry.rings)) * 0.0015 * 100) /
          100,
        geometry
      );
      // this.$emit('getShapearea', Math.round(
      //     Math.abs(this.calcatArea(geometry.rings)) *
      //     0.0015 *
      //     100
      // ) / 100 + '亩', geometry)
    },
    //搜索框回显
    onSearchResult(pois) {
      if (pois.length > 0) {
        var point = this.gcj02towgs84(pois[0].lng, pois[0].lat);
        this.zoomToPOI(point[0], point[1]);
      }
    },
    // 图斑飞入定位
    zoomTo(extent, scale) {
      if (this.mapView != null) {
        this.mapView.goTo(
          {
            target: extent,
            scale: scale,
          },
          { duration: 3000 }
        );
      }
    },
    // 搜索框定位
    zoomToPOI(x, y) {
      var point = {
        type: "point", // casts as new Point()
        longitude: x,
        latitude: y,
      };
      this.mapControl.mapView.graphics.removeAll();
      var graphicimg = new this.mapControl.esriModules.Graphic({
        geometry: point,
        // symbol: {
        //     type: "picture-marker", // casts as new PictureMarkerSymbol()
        //     width: "64px",
        //     height: "64px",
        //     xoffset: 0,
        //     yoffset: 15
        // }
      });
      this.mapControl.mapView.graphics.add(graphicimg);
      this.mapControl.mapView.goTo(
        {
          target: graphicimg,
          zoom: 15,
        },
        { duration: 1000 }
      );
    },
    //计算图形面积
    calcatArea(rings) {
      if (rings && this.mapControl) {
        var polygon = {
          type: "polygon", // casts as Polygon
          rings: rings,
          spatialReference: { wkid: 4326 },
        };
        let esriModules = this.mapControl.esriModules;
        return esriModules.geometryEngine.geodesicArea(
          polygon,
          "square-meters"
        );
        // return this.esriModules.geometryEngine.planarArea(polygon, 'square-meters')
      }
      return 0;
    },
    /**
     * GCJ02 转换为 WGS84
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    gcj02towgs84(lng, lat) {
      if (this.out_of_china(lng, lat)) {
        return [lng, lat];
      } else {
        var dlat = this.transformlat(lng - 105.0, lat - 35.0);
        var dlng = this.transformlng(lng - 105.0, lat - 35.0);
        var radlat = (lat / 180.0) * PI;
        var magic = Math.sin(radlat);
        magic = 1 - PE * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / (((PA * (1 - PE)) / (magic * sqrtmagic)) * PI);
        dlng = (dlng * 180.0) / ((PA / sqrtmagic) * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat];
      }
    },
    drowLine() {
      this.mapControl.drowLine();
    },
    deletelayer() {
      this.$refs.mapControl.removedraw();
    },
    showlayer() {
      this.isshowspeciallayer = !this.isshowspeciallayer;
    },
    addservicelayer(eve) {
      // 创建FeatureLayer实例，并传入服务的URL
      const featureLayer = new this.mapControl.esriModules.FeatureLayer({
        url: eve,
        outFields: ["*"],
      });
      this.servicelayers.push(featureLayer);
      // 将FeatureLayer添加到Map视图中
      this.mapControl.map.add(featureLayer);
    },
    addordeletlayer(eve) {
      if (eve.isshow) {
        this.addservicelayer(eve.url + "/" + eve.layerid);
      } else {
        let indexs = null;
        this.servicelayers.forEach((element, index) => {
          if (
            eve.url == element.url &&
            parseInt(eve.layerid) === element.layerId
          ) {
            this.mapControl.map.remove(element);
            indexs = index;
          }
        });
        this.servicelayers.splice(indexs, 1);
      }
    },
    closeservice() {
      if (this.servicelayers.length > 0) {
        this.servicelayers.forEach((element) => {
          this.mapControl.map.remove(element);
        });
        this.servicelayers = [];
      }
    },
    querylayerdata() {
      let query = new this.mapControl.esriModules.Query();
      this.analysedata = [];
      // 将点击的点放入查询对象中
      query.geometry = this.drawgeometry;
      query.returnGeometry = true;
      query.outFields = ["*"];
      // 设置缓冲区
      // 设置查询方式（相交）
      query.spatialRelationship =
        this.mapControl.esriModules.Query.SPATIAL_REL_INTERSECTS;

      var fill = new this.mapControl.esriModules.SimpleFillSymbol(
        this.mapControl.esriModules.SimpleFillSymbol.STYLE_SOLID,
        new this.mapControl.esriModules.Color([0, 255, 0])
      );
      // var geometryService = new this.mapControl.esriModules.GeometryService(
      //   "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
      // );
      var geometryService = new this.mapControl.esriModules.GeometryService(
        "http://1.94.43.37:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/"
      );
      let url = this.servicelayers[0].url + "/0";
      let data = [];
      let queryTask = new this.mapControl.esriModules.QueryTask(url);
      queryTask.execute(query).then((res) => {
        this.loading = this.$loading({
          lock: true,
          text: "正在查询",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        var features = res.features;
        for (var i = 0; i < features.length; i++) {
          let feature = features[i];
          let p1 = new Promise((resolve, reject) => {
            geometryService
              .intersect([feature.geometry], this.drawgeometry)
              .then((res) => {
                feature.attributes["intersect"] = res[0].rings;
                resolve(feature);
              })
              .catch((res) => {});
          });
          data.push(p1);
        }
        Promise.all(data).then((res) => {
          res.forEach((element) => {
            var graphicsLayer = new this.mapControl.esriModules.GraphicsLayer();
            this.mapControl.map.add(graphicsLayer);
            let graphicarea =
              Math.round(
                Math.abs(this.calcatArea(element.attributes.intersect)) *
                  0.0015 *
                  100
              ) / 100;
            element.attributes["graphicarea"] = graphicarea;
            let polygon = new this.mapControl.esriModules.Polygon({
              rings: element.attributes.intersect,
            });
            this.analysedata.push(element.attributes);
            // 创建Graphic并设置geometry和符号
            var graphic = new this.mapControl.esriModules.Graphic({
              geometry: polygon,
              symbol: fill,
            });
            // 将Graphic添加到GraphicsLayer
            graphicsLayer.add(graphic);
          });
          this.cutarray(this.analysedata);
          this.loading.close();
        });

        //  geometrys = [];
        // if (features && features.length > 0) {
        //   features.forEach((element) => {
        //     geometrys.push(element.geometry);
        //   });
        // }
        // let GeometryService = new this.mapControl.esriModules.GeometryService(
        //   "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/"
        // );
        // GeometryService.intersect(geometrys, this.drawgeometry)
        //   .then((res) => {
        //     debugger
        //     for (let index = 0; index < res.length; index++) {
        //       features[index].attributes["intersectgeometry"] = res[index];
        //     }
        //     obj.data = features;
        //     resolve(obj);
        //   })
        //   .catch((res) => {
        //     console.log(res);
        //   });
      });
    },
    cutarray(arr) {
      let data = [...arr];
      let claerdata = [
        ...data.filter((item, index, self) => {
          return self.findIndex((t) => t.DLMC === item.DLMC) === index;
        }),
      ];
      let types = [];
      claerdata.forEach((element) => {
        let obj = {
          DLMC: element.DLMC,
          graphicarea: 0,
        };
        types.push(obj);
      });
      types.forEach((element) => {
        data.forEach((olditem) => {
          console.log();
          if (element.DLMC == olditem.DLMC) {
            element.graphicarea += olditem.graphicarea;
          }
        });
      });
      this.analysedata = types;
    },
    transformlat(lng, lat) {
      var ret =
        -100.0 +
        2.0 * lng +
        3.0 * lat +
        0.2 * lat * lat +
        0.1 * lng * lat +
        0.2 * Math.sqrt(Math.abs(lng));
      ret +=
        ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
          2.0) /
        3.0;
      ret +=
        ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) *
          2.0) /
        3.0;
      ret +=
        ((160.0 * Math.sin((lat / 12.0) * PI) +
          320 * Math.sin((lat * PI) / 30.0)) *
          2.0) /
        3.0;
      return ret;
    },

    transformlng(lng, lat) {
      var ret =
        300.0 +
        lng +
        2.0 * lat +
        0.1 * lng * lng +
        0.1 * lng * lat +
        0.1 * Math.sqrt(Math.abs(lng));
      ret +=
        ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
          2.0) /
        3.0;
      ret +=
        ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) *
          2.0) /
        3.0;
      ret +=
        ((150.0 * Math.sin((lng / 12.0) * PI) +
          300.0 * Math.sin((lng / 30.0) * PI)) *
          2.0) /
        3.0;
      return ret;
    },
    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    out_of_china(lng, lat) {
      return (
        lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false
      );
    },

    initCompleted: function (esriMapControl) {
      this.mapControl = esriMapControl;
      this.mapView = esriMapControl.mapView;
      this.$emit("initCompleted", this);
    },
  },
};
</script>
<style lang="scss" scoped>
.locationHtml {
  position: absolute;
  left: 20px;
  top: 10px;
  height: 40px !important;
  width: 18% !important;

  background-color: #fff;
  border: 1px solid #ebeef5;
  // border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 7px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-around;
  i {
    cursor: pointer;
  }
}

.search-box {
  height: 35px !important;
  border-radius: 0 !important;
  border: 1px solid #dcdfe6 !important;
  box-shadow: none !important;
  box-sizing: border-box;
  width: 15% !important;
  font-size: 14px;
  top: 10px;
  right: 10px;
  text-align: left;
  position: absolute !important;
}

::v-deep .el-vue-search-box-container .search-box-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.search-box .search-tips ul li {
  height: 20px !important;
  box-shadow: none !important;
}

.search-box .search-tips {
  /* border: none !important; */
  left: 0px;
}

::v-deep.el-vue-search-box-container .search-box-wrapper .search-btn {
  width: 45px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  color: white !important;
  background: #519efe !important;
}
</style>
