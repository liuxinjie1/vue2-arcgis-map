<template>
  <div style="width: 100%; height: 100%; position: relative">
    <esri-map
      ref="mapControl"
      @initCompleted="initCompleted"
      style="width: 100%; height: 100%"
      @getShapearea="getShapearea"
      @getYxsj="getYxsj"
    ></esri-map>
  </div>
</template>
<script>
import { EventBus } from "../../utils/eventBus";
import EsriMap from "../mapplugin/index.vue";
import speciallayer from "../mapplugin/speciallayer";
import glandanalyse from "../mapplugin/glandanalyse";
import * as shapefile from "shapefile";
import proj4 from "proj4";
import QRCode from "qrcode";

var PI = 3.1415926535897932384626;
var PA = 6378245.0;
var PE = 0.00669342162296594323;
export default {
  components: {
    "esri-map": EsriMap,
    "gland-analyse": glandanalyse,
    "special-layer": speciallayer,
  },
  props: {
    geometry: {
      type: Object,
      default: null,
    },
    trackPoints: {
      type: Array,
      default: () => [],
    },
    queryUrl: {
      type: String,
      default: "",
    },
  },
  watch: {
    trackPoints: {
      handler(newval, oldval) {
        if (newval.length === 0) {
          this.stopMotion();
        }
      },
    },
  },
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
      analysedata: [],
      loading: null,
      trackGraphic: null,
      trackLineGraphic: null, // 用于动态更新轨迹线
      startPointGraphic: null,
      endPointGraphic: null,
      animationFrame: null,
      currentPointIndex: 0, // 当前点索引
      animationDuration: 50, // 每段动画的时间，单位ms
      isPaused: false, // 是否暂停
      trackLinePaths: [], // 轨迹线的路径
      trajectoryLayer: null,
      trajectoryLineLayer: null,
      startPointSymbol: {
        type: "picture-marker",
        url: require("../../assets/image/kaishi.png"),
        height: 60,
        width: 60,
        xoffset: 0,
        yoffset: 15,
        angle: 0,
      },
      endPointSymbol: {
        type: "picture-marker",
        url: require("../../assets/image/jieshu.png"),
        height: 60,
        width: 60,
        xoffset: 0,
        yoffset: 15,
        angle: 0,
      },
      selectedArrowSymbol: {
        url: require("../../assets/image/arrow_selected.png"),
        height: 45,
        width: 45,
        xoffset: 0,
        yoffset: 0,
        type: "picture-marker",
        angle: 0,
      },
      normalArrowSymbol: {
        type: "picture-marker",
        url: require("../../assets/image/arrow.png"),
        height: 35,
        width: 35,
        xoffset: 0,
        yoffset: 0,
        angle: 0,
      },
      yellowQrCodeSymbol: {
        type: "picture-marker",
        url: require("../../assets/image/jkm_hm.png"),
        height: 25,
        width: 25,
        xoffset: 0,
        yoffset: 0,
        angle: 0,
      },
      greenQrCodeSymbol: {
        type: "picture-marker",
        url: require("../../assets/image/jkm_lm.png"),
        height: 25,
        width: 25,
        xoffset: 0,
        yoffset: 0,
        angle: 0,
      },
      redQrCodeSymbol: {
        type: "picture-marker",
        url: require("../../assets/image/jkmtb.png"),
        height: 25,
        width: 25,
        xoffset: 0,
        yoffset: 0,
        angle: 0,
      },
      ArrowGrahicLayer: null,
      GraphicalLocationLayer: null,
      arrows: null,
      WebTileLayers: null,
      historyimagedata: null,
      Locationgraphic: null,
      onlineLayer: null, // 在线人员图层
      boundaryLayer: null, // 管理边界图层
      boundaryLayers: [], // 存储所有边界图层
      QrCodeLayer: null, // 二维码图层
      elapsedTime: null, // 动画已经运行的时间
      startTime: null, // 动画已经运行的时间
      qrcodedata: null,
      patropeoplelayer: null, //巡逻人员图层
      smallGraphicLayer: null, //小图斑图层
      selectedSmallGraphic: null, //选中的小图斑
      selectedSmallGraphicSymbol: {
        type: "simple-fill", // casts as SimpleFillSymbol
        color: [0, 208, 255, 0.5],
        style: "solid",
        outline: {
          // casts as SimpleLineSymbol
          color: [0, 196, 11],
          width: 1,
        },
      }, //选中的样式
      defaultSmallGraphicSymbol: {
        type: "simple-fill", // casts as SimpleFillSymbol
        color: [255, 255, 0, 0.5],
        style: "solid",
        outline: {
          // casts as SimpleLineSymbol
          color: [255, 0, 0],
          width: 1,
        },
      }, //默认样式
      dlgraphicdatas: [],
      analysisdatalayer: null, //压盖分析图层
      drawGraphicalLayer: null, // 绘制图形的图层
      polymerizationgraphicsLayer: null, // 聚合图形的图层
      polymerizationdata: [], // 聚合数据
      mapzoom: 0, // 地图缩放级别
      zoomWatchHandle: null, // 监听地图缩放的句柄
    };
  },
  mounted() {
    window.triggerVideoCallEvent = this.triggerVideoCallEvent;
    this.initproj();
    this.coordinateConvert(
      39475674.9124,
      3954532.0596,
      "EPSG:4527",
      "EPSG:4326"
    );
  },
  methods: {
    initproj() {
      // 初始化大地2000和WGS84的定义
      // 定义投影坐标系，例如WGS 1984 Web Mercator
      //国家大地2000坐标_3度分带_117度中央经线_有带号
      proj4.defs(
        "EPSG:4527",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
      );
      //国家大地2000坐标_3度分带_117度中央经线_没带号
      proj4.defs(
        "EPSG:4548",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
      );
      //国家大地2000坐标_3度分带_120度中央经线_没带号
      proj4.defs(
        "EPSG:4549",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
      );
      //国家大地2000坐标_3度分带_120度中央经线_有带号
      proj4.defs(
        "EPSG:4528",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
      );

      //国家大地2000坐标_119度10分中央经线_无带号
      proj4.defs(
        "EPSG:4498",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=20500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs"
      );
      //西安80坐标_119度10分中央经线_无带号
      proj4.defs(
        "EPSG:2334",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=20500000 +y_0=0 +ellps=IAU76 +units=m +no_defs +type=crs"
      );

      //西安80坐标_3度分带_117度中央经线_无带号
      proj4.defs(
        "EPSG:2384",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=IAU76 +units=m +no_defs +type=crs"
      );

      //西安80坐标_3度分带_117度中央经线_有带号
      proj4.defs(
        "EPSG:2363",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=IAU76 +units=m +no_defs +type=crs"
      );

      //西安80坐标_3度分带_120度中央经线_有带号
      proj4.defs(
        "EPSG:2364",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +ellps=IAU76 +units=m +no_defs +type=crs"
      );

      //西安80坐标_3度分带_120度中央经线_无带号
      proj4.defs(
        "EPSG:2385",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=IAU76 +units=m +no_defs +type=crs"
      );

      //北京54坐标_3度分带_120度中央经线_无带号
      proj4.defs(
        "EPSG:2437",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=krass +towgs84=15.53,-113.82,-41.38,0,0,0.814,-0.38 +units=m +no_defs +type=crs"
      );

      //北京54坐标_3度分带_117度中央经线_无带号
      proj4.defs(
        "EPSG:2436",
        "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=krass +towgs84=31.4,-144.3,-74.8,0,0,0.814,-0.38 +units=m +no_defs +type=crs"
      );

      //北京54坐标_3度分带_120度中央经线_有带号
      proj4.defs(
        "EPSG:2416",
        "+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=40500000 +y_0=0 +ellps=krass +towgs84=15.53,-113.82,-41.38,0,0,0.814,-0.38 +units=m +no_defs +type=crs"
      );

      //WGS1984
      proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs +type=crs");
    },
    // 查询图层
    async queryFeatureLayer(eve) {
      const featuerLayer = new this.mapControl.esriModules.FeatureLayer({
        url: "http://1.94.43.37:6080/arcgis/rest/services/XTSLC/MapServer/0",
        outFields: ["*"],
      });
      const query = featuerLayer.createQuery();
      query.where = "1 = 1"; // 示例：查询人口大于 100 万的城市
      query.outFields = ["*"]; // 指定返回的字段
      query.returnGeometry = true; // 返回几何信息（可选）
      try {
        let data = [];
        const featureSet = await featuerLayer.queryFeatures(query);
        const featuredata = featureSet.features;
        for (let index = 0; index < featuredata.length; index++) {
          const element = featuredata[index];
          if (element.attributes.LC_CODE == eve) {
            for (
              let index = 0;
              index < element.geometry.rings.length;
              index++
            ) {
              const rings = element.geometry.rings[index];
              data.push(rings);
            }
          }
        }
        const geomertry = this.drawfores(data);
        return geomertry;
      } catch (error) {
        console.error("查询失败:", error);
      }
    },
    // 坐标转换
    coordinateConvert(x, y, from = "EPSG:4527", to = "EPSG:4326") {
      var pointInMercator = [parseFloat(x), parseFloat(y)]; // 单位：米
      var pointInLatLng = proj4(from, to, pointInMercator);
      return pointInLatLng;
    },
    drawGraphicalLocation(color) {
      if (!this.geometry) {
        return;
      }
      this.removelocationgraphic();
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: this.geometry.rings,
        spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
      });
      if (!color) {
        color = [255, 0, 0];
      }
      this.Locationgeometry = this.geometry.rings;
      this.Locationgraphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // casts as SimpleFillSymbol
          color: [255, 255, 0, 0],
          style: "solid",
          outline: {
            // casts as SimpleLineSymbol
            color: color,
            width: 2,
          },
        },
      });
      if (this.mapView.graphics._items.length > 0) {
        this.mapView.graphics._items.forEach((element) => {
          this.mapView.graphics.remove(element);
        });
      }
      // this.GraphicalLocationLayer.removeAll();
      // this.mapView.graphics.add(graphic);
      this.GraphicalLocationLayer.add(this.Locationgraphic);
      // 根据图形的范围调整地图视图
      // this.mapView.extent = graphic.geometry.extent;

      // 设置指定的缩放级别
      // this.mapView.zoom = 10;
      this.zoomTo(this.Locationgraphic.geometry.extent);
    },
    removelocationgraphic() {
      if (this.GraphicalLocationLayer) {
        this.GraphicalLocationLayer.removeAll();
      }
    },

    drawGraphicalLocation_LY() {
      if (!this.geometry) {
        return;
      }
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: this.geometry.rings,
        spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
      });
      this.Locationgeometry = this.geometry.rings;
      this.Locationgraphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill",
          color: [255, 165, 0, 0.3], // 橙色填充，30% 不透明度
          style: "solid",
          outline: {
            color: [255, 69, 0], // 深橙/橙红色边框，更醒目
            width: 2,
          },
        },
      });
      if (this.mapView.graphics._items.length > 0) {
        this.mapView.graphics._items.forEach((element) => {
          this.mapView.graphics.remove(element);
        });
      }
      // this.GraphicalLocationLayer.removeAll();
      // this.mapView.graphics.add(graphic);
      this.GraphicalLocationLayer.add(this.Locationgraphic);
      // 根据图形的范围调整地图视图
      // this.mapView.extent = graphic.geometry.extent;

      // 设置指定的缩放级别
      // this.mapView.zoom = 10;
      this.zoomTo(this.Locationgraphic.geometry.extent);
    },
    drawfores(data) {
      let xyss = [];
      data.forEach((xys) => {
        let xys1 = [];
        xys.forEach((xy, index) => {
          const xys = this.coordinateConvert(xy[0], xy[1]);
          xys1.push(xys);
        });
        xyss.push(xys1);
      });
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: xyss,
        spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
      });
      const geomertry = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // casts as SimpleFillSymbol
          color: [255, 255, 0, 0],
          style: "solid",
          outline: {
            // casts as SimpleLineSymbol
            color: [255, 0, 0, 1],
            width: 2,
          },
        },
      });
      return geomertry;
      // this.mapView.graphics.add(graphic);
    },
    //图形定位
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
    removedraw() {
      this.$refs.mapControl.removedraw();
    },
    //增加图层并且在该图层绘制图形
    areaMeasurement() {
      this.$refs.mapControl.areaMeasurement(this.redrawingLayer);
    },
    //获取所绘制图形面积
    getShapearea(geometry) {
      this.drawgeometry = geometry;
      const area = {
        squaremeters: this.calcatArea(geometry.rings),
        mu: Math.round(this.calcatArea(geometry.rings) * 0.0015 * 100) / 100,
        kilometer:
          Math.round(
            (Math.abs(this.calcatArea(geometry.rings)) / 1000000) * 100
          ) / 100,
        hectare:
          Math.round(
            (Math.abs(this.calcatArea(geometry.rings)) / 10000) * 100
          ) / 100,
      };
      console.log(JSON.stringify(this.drawgeometry));

      this.$emit("getShapearea", area, geometry);
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
    zoomTo(extent, scale, time = 3000, zoom = null) {
      if (this.mapView != null) {
        this.mapView.goTo(
          {
            target: extent,
            scale: scale,
          },
          { duration: time }
        );
      }
    },
    // 搜索框定位
    zoomToPOI(x, y, zoom = 15, time = 1000) {
      var point = {
        type: "point", // casts as new Point()
        longitude: x,
        latitude: y,
      };
      // this.mapControl.mapView.graphics.removeAll();
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
      // this.mapControl.mapView.graphics.add(graphicimg);
      this.mapControl.mapView.goTo(
        {
          target: graphicimg,
          zoom: zoom,
        },
        { duration: time }
      );
    },
    //计算图形面积
    calcatArea(rings) {
      if (rings && this.mapControl) {
        // var polygon = {
        //   type: "polygon", // casts as Polygon
        //   rings: rings,
        //   spatialReference: {
        //     wkid: 4326, // WGS84坐标系
        //   },
        // };
        var polygon = new this.mapControl.esriModules.Polygon({
          rings: rings,
          spatialReference: { wkid: 4326 },
        });
        let esriModules = this.mapControl.esriModules;
        return esriModules.geometryEngine.geodesicArea(
          polygon,
          "square-meters"
        );

        // return this.mapControl.esriModules.geometryEngine.planarArea(polygon, 'square-meters')
      }
      return 0;
    },
    initTrackGraphic() {
      if (this.trackPoints.length <= 0) {
        return;
      }
      this.trackPoints = this.trackPoints.map((point) => {
        return {
          x: parseFloat(point.x),
          y: parseFloat(point.y),
        };
      });
      // 创建自定义图层
      if (this.trackLineGraphic) {
        this.trajectoryLineLayer.removeAll();
      }
      if (this.startPointGraphic) {
        this.trajectoryLayer.removeAll();
      }
      this.trajectoryLayer = new this.mapControl.esriModules.GraphicsLayer();
      this.trajectoryLineLayer =
        new this.mapControl.esriModules.GraphicsLayer();
      this.mapControl.map.add(this.trajectoryLayer, 1);
      this.mapControl.map.add(this.trajectoryLineLayer, 0);
      // 绘制轨迹线
      this.trackLineGraphic = new this.mapControl.esriModules.Graphic({
        geometry: {
          type: "polyline",
          paths: this.trackPoints.map((point) => [point.x, point.y]),
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "simple-line",
          color: [44, 100, 167],
          width: 3,
        },
      });
      // 绘制起点
      this.startPointGraphic = new this.mapControl.esriModules.Graphic({
        geometry: {
          type: "point",
          longitude: this.trackPoints[0].x,
          latitude: this.trackPoints[0].y,
        },
        symbol: this.startPointSymbol,
        zIndex: 1000,
      });

      // 绘制终点
      this.endPointGraphic = new this.mapControl.esriModules.Graphic({
        geometry: {
          type: "point",
          longitude: this.trackPoints[this.trackPoints.length - 1].x,
          latitude: this.trackPoints[this.trackPoints.length - 1].y,
        },
        symbol: this.endPointSymbol,
        zIndex: 1000,
      });

      // 绘制运动点
      this.trackGraphic = new this.mapControl.esriModules.Graphic({
        geometry: {
          type: "point",
          longitude: this.trackPoints[0].x,
          latitude: this.trackPoints[0].y,
        },
        symbol: {
          type: "simple-marker",
          color: "#E8376E",
          size: "20px",
          outline: {
            // 设置边框
            color: "#E8376E", // 边框颜色
            width: 1, // 边框宽度
          },
        },
        zIndex: -1,
      });

      this.trajectoryLayer.addMany([
        this.startPointGraphic,
        this.endPointGraphic,
        this.trackGraphic,
      ]);
      this.trajectoryLineLayer.addMany([this.trackLineGraphic]);
      this.zoomTo(this.trackLineGraphic, null, 500);
    },
    // 删除轨迹图层
    removeTrack() {
      if (this.trackLineGraphic) {
        this.trajectoryLineLayer.removeAll();
      }
      if (this.startPointGraphic) {
        this.trajectoryLayer.removeAll();
      }
    },
    // 启动或继续运动
    startMotion() {
      if (this.animationFrame) return; // 防止重复启动
      this.startTime = performance.now();

      // 初始化轨迹线（如果是继续运动，则从之前的路径开始）
      this.trackLineGraphic = new this.mapControl.esriModules.Graphic({
        geometry: {
          type: "polyline",
          paths: this.trackLinePaths, // 从暂停时保存的路径开始
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "simple-line",
          color: [55, 232, 86],
          width: 4,
        },
      });
      // 如果是暂停后继续，使用保存的路径来绘制轨迹线
      this.trajectoryLineLayer.add(this.trackLineGraphic);
      // 如果之前是暂停状态，则从上次的索引开始
      if (this.isPaused) {
        this.isPaused = false;
        this.animateTrack(true); // 继续运动
        return;
      } else {
        this.currentPointIndex = 0; // 如果是第一次开始，从头开始
        this.animateTrack(false);
      }
    },

    // 暂停运动
    pauseMotion() {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      this.isPaused = true; // 标记为暂停状态
      // 记录当前动画已经运行的时间
      this.elapsedTime += performance.now() - this.startTime;
    },

    // 停止运动
    stopMotion() {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      this.currentPointIndex = 0;
      this.isPaused = false; // 重置暂停状态
      this.trackLinePaths = []; // 重置轨迹路径
      this.elapsedTime = 0; // 重置已经运行的时间
      this.initTrackGraphic();
    },

    // 动画轨迹
    animateTrack(isResuming = false) {
      if (this.currentPointIndex >= this.trackPoints.length - 1) {
        this.stopMotion();
        return;
      }

      const duration = this.animationDuration; // 动画总时长
      let totalLength = 0; // 总路径长度

      // 计算轨迹总长度（基于轨迹中的点）
      for (let i = 0; i < this.trackPoints.length - 1; i++) {
        totalLength += this.calculateDistance(
          this.trackPoints[i],
          this.trackPoints[i + 1]
        );
      }

      let startTime = performance.now();
      if (isResuming) {
        startTime -= this.elapsedTime; // 恢复时，修正已经过去的时间
      }

      const animate = (currentTime) => {
        if (this.isPaused) {
          this.elapsedTime += currentTime - startTime;
          return;
        }

        // 计算已运行时间的比例
        const elapsedTime = (currentTime - startTime) / 1000; // 转换为秒
        let distanceCovered = (elapsedTime / duration) * totalLength; // 计算已走过的距离

        // **根据已走过的距离插值计算当前点**
        let currentPosition = this.getPointAtDistance(distanceCovered);

        // 更新运动点位置
        this.updateTrackPosition(currentPosition);
        this.updateTrackLine(currentPosition);

        if (elapsedTime < duration) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          this.stopMotion();
        }
      };

      this.animationFrame = requestAnimationFrame(animate);
    },
    // 计算两点之间的距离
    calculateDistance(point1, point2) {
      const xDiff = point2.x - point1.x;
      const yDiff = point2.y - point1.y;
      return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    },

    // 根据已走过的距离计算当前位置
    getPointAtDistance(distance) {
      let accumulatedDistance = 0;
      for (let i = 0; i < this.trackPoints.length - 1; i++) {
        const startPoint = this.trackPoints[i];
        const endPoint = this.trackPoints[i + 1];
        const segmentDistance = this.calculateDistance(startPoint, endPoint);

        // 检查目标距离是否落在当前段内
        if (accumulatedDistance + segmentDistance >= distance) {
          const remainingDistance = distance - accumulatedDistance;
          const ratio = remainingDistance / segmentDistance;
          const interpolatedX =
            startPoint.x + (endPoint.x - startPoint.x) * ratio;
          const interpolatedY =
            startPoint.y + (endPoint.y - startPoint.y) * ratio;
          return { x: interpolatedX, y: interpolatedY };
        }

        accumulatedDistance += segmentDistance;
      }

      // 如果超出最大距离，返回终点
      return this.trackPoints[this.trackPoints.length - 1];
    },

    // 更新运动点位置
    updateTrackPosition(point) {
      if (!point) return;

      // 更新运动点的位置
      this.trackGraphic.geometry = {
        type: "point",
        longitude: parseFloat(point.x),
        latitude: parseFloat(point.y),
      };

      // 确保运动点始终在图层中
      if (!this.trajectoryLayer.graphics.includes(this.trackGraphic)) {
        this.trajectoryLayer.add(this.trackGraphic);
      }
    },

    // 更新轨迹线
    updateTrackLine(point) {
      if (!point) return;

      // 将当前点添加到轨迹线路径中
      this.trackLinePaths.push([parseFloat(point.x), parseFloat(point.y)]);

      // 更新轨迹线的几何对象
      this.trackLineGraphic.geometry = {
        type: "polyline",
        paths: [this.trackLinePaths],
        spatialReference: { wkid: 4326 },
      };
    },
    calculateAzimuth(yaw) {
      // 转换 yaw 从 [-180°, 180°] 到 [0°, 360°]
      let azimuth = (yaw + 180) % 360;
      if (azimuth < 0) azimuth += 360; // 确保方位角在 [0, 360] 范围内
      return azimuth;
    },
    // 创建所有箭头
    createArrows(objs, isClear) {
      this.ArrowGrahicLayer.removeAll();
      objs.forEach((element) => {
        var pointstr = element.points_json;
        try {
          if (pointstr) {
            var pointObj = JSON.parse(pointstr);
            if (pointObj && pointObj.length > 0) {
              var point = pointObj[0];
              if (point && point.x !== 0 && point.y !== 0) {
                var x = point.x;
                var y = point.y;
                var id = element.guid;
                var angle;
                if (point.angle) {
                  angle = point.angle;
                } else {
                }
                var angle = (point.yaw - point.roll + 360) % 360;
                this.createArrow(x, y, angle, id, element, isClear);
              } else {
                // 不存在坐标和方位角度，地图显示不出来图像
              }
            }
          }
        } catch (e) {}
      });
      // if (this.arrows.length > 0) {
      //   this.arrows.forEach((item) => {
      //     this.grahicLayer.add(item)
      //   })
      // }
    },
    // 创建一个箭头
    createArrow(x, y, a, id, userdata, isClear) {
      var pt = {
        type: "point", // autocasts as new Point()
        longitude: x,
        latitude: y,
      };
      var symbol = this.normalArrowSymbol;
      // 无人机照片
      if (userdata.fjmode === "7") {
        symbol = this.normalAirSymbol;
      }
      // 全景图照片
      if (userdata.fjmode === "8") {
        symbol = this.normal_360_icon;
      }
      symbol.angle = a;
      var g = new this.mapControl.esriModules.Graphic({
        geometry: pt,
        symbol: symbol,
        attributes: {
          id: id,
          angle: a,
          userdata: userdata,
          type: "Arrow",
        },
      });

      if (!this.arrows) {
        this.arrows = {};
      }
      this.arrows[id] = g;
      if (isClear) {
        this.arrowsAll[id] = g;
      }
      this.drawArrow(g);
    },
    // 绘制方位角
    drawArrow(item) {
      this.ArrowGrahicLayer.add(item);
    },
    // 清除方位角(不传入标识码时候清空所有)
    ClearArrows(bsm) {
      if (this.arrows && this.arrows[bsm]) {
        this.ArrowGrahicLayer.remove(this.arrows[bsm]);
      } else {
        if (this.arrows && Object.keys(this.arrows).length > 0) {
          for (var item in this.arrows) {
            this.ArrowGrahicLayer.remove(this.arrows[item]);
          }
        }
      }
    },
    // 清除方位角(不传入标识码时候清空所有)
    ClearArrowsAll() {
      if (this.arrowsAll && Object.keys(this.arrowsAll).length > 0) {
        for (var item in this.arrowsAll) {
          this.ArrowGrahicLayer.remove(this.arrowsAll[item]);
        }
      }
    },
    // 通过bsm选中箭头 ,notgoto:重新定位，默认是重新定位
    selectArrow(bsm, notgoto) {
      this.unselectArrow();
      if (this.arrows && this.arrows[bsm]) {
        this.selectedArrow = this.arrows[bsm];
        this.changeSymbol(this.selectedArrow, true);
      }
      if (this.selectedArrow && !notgoto) {
        this.mapView.goTo(
          {
            target: this.selectedArrow,
            zoom: 16,
          },
          { duration: 1000 }
        );
        // 通过bsm查找箭头
      }
    },
    // 点击箭头选中
    MapclickArrow(result) {
      if (result && result.graphic && result.graphic.attributes.id) {
        let bsm = result.graphic.attributes.id;
        let groupid = result.graphic.attributes.groupid;
        let para = {
          bsm: result.graphic.attributes.id,
          groupid: result.graphic.attributes.groupid,
        };
        this.$emit("selectArrow", para);

        this.selectArrow(bsm, true);
      }
    },
    // 更新箭头的位置及方位，视频播放时间改变时调用
    updataArrowPostion(bsm, x, y, a) {
      if (this.arrows && this.arrows[bsm]) {
        let arrow = this.arrows[bsm];
        this.changeSymbol(arrow, true, a);
        arrow.geometry = {
          type: "point",
          x: x,
          y: y,
          spatialReference: {
            wkid: 4326,
          },
        };
        this.mapView.goTo(
          {
            target: arrow,
            zoom: 15,
          },
          { duration: 0 }
        );
      }
    },
    // 取消选中箭头
    unselectArrow() {
      if (this.selectedArrow) {
        this.changeSymbol(this.selectedArrow, false);
      }
      this.selectedArrow = null;
    },
    // 修改箭头的样式
    changeSymbol: function (old, isSelect, angle) {
      let newSymbol = null;
      if (isSelect) {
        newSymbol = this.clone(this.selectedArrowSymbol);
        if (old.attributes.userdata.fjmode == "7") {
          newSymbol = this.clone(this.selectedAirSymbol);
        }
        if (old.attributes.userdata.fjmode == "8") {
          newSymbol = this.clone(this.select_360_icon);
        }
      } else {
        newSymbol = this.clone(this.normalArrowSymbol);
        if (old.attributes.userdata.fjmode == "7") {
          newSymbol = this.clone(this.normalAirSymbol);
        }
        if (old.attributes.userdata.fjmode == "8") {
          newSymbol = this.clone(this.normal_360_icon);
        }
      }
      newSymbol.angle = old.symbol.angle;
      if (angle) {
        newSymbol.angle = angle;
      }
      old.symbol = newSymbol;
    },
    // 对象复制
    clone: function (obj) {
      var txt = JSON.stringify(obj);
      return JSON.parse(txt);
    },
    //获取影像数据
    getYxsj(level, x, y) {
      let url =
        "https://service.sdmap.gov.cn/imgmeta?tk=44c2ef89d6e7337993d863653582d3b9&wktpoint=POINT(" +
        x +
        "%20" +
        y +
        ")&level=" +
        level +
        "&callback=jQuery112407324538167038506_1655169363471&_=1655169363474";
      this.$http
        .get(url)
        .then((ret) => {
          let start = ret.indexOf("(");
          let json = ret.substring(start + 1, ret.length - 1);
          if (json != null) {
            let jsonlist = JSON.parse(json);
            let list = [];
            for (var i = 0; i < jsonlist.length; i++) {
              let obj = {
                appLcaation: false,
                children: null,
                classname: "datafour",
                count: 0,
                data: {
                  cam: jsonlist[i].cam,
                  el: jsonlist[i].el,
                  et: jsonlist[i].et,
                  lid: jsonlist[i].lid,
                  name: jsonlist[i].name,
                  reso: jsonlist[i].reso,
                  sl: jsonlist[i].sl,
                  st: jsonlist[i].st,
                  type: jsonlist[i].type,
                  url: jsonlist[i].url,
                },
                disabled: false,
                id: jsonlist[i].lid,
                label:
                  this.formatDateyx(jsonlist[i].st, 0) +
                  "," +
                  jsonlist[i].reso +
                  "米",
                latitude: null,
                longitude: null,
                lxr: null,
                phone: null,
                sbbsm: null,
                state: 0,
                unit: null,
                value: null,
                url: jsonlist[i].url,
                sort: parseInt(this.formatDateyx(jsonlist[i].st, 1)),
              };
              obj.data.url = obj.url;
              obj.data.classname = "datafour";
              list.push(obj);
            }
            const data = list.sort(function (a, b) {
              return b.sort - a.sort;
            });
            this.$emit("historyimagedata", data);
          } else {
            this.$message.error(ret.data.Message);
          }
        })
        .catch((err) => {
          // this.$message('GetHLQKInfo网络异常.')
          console.error(err.message);
        });
    },
    //格式化数据
    formatDateyx(val, sort) {
      let value = val.toString();
      if (value.length == 8) {
        if (sort == 1) {
          if (val === 20210517) {
            return 20280517;
          }
          return value;
        }
        return (
          value.substring(0, 4) +
          "年" +
          value.substring(4, 6) +
          "月" +
          value.substring(6, 8) +
          "日"
        );
      } else if (value.length == 6) {
        if (sort == 1) {
          return value + "01";
        }
        return value.substring(0, 4) + "年" + value.substring(4, 6) + "月";
      } else if (value.length == 4) {
        if (sort == 1) {
          return value + "0101";
        }
        return value.substring(0, 4) + "年";
      }
    },
    addWebTileLayer(urlss) {
      // this.removeWebTileLayer();
      // this.WebTileLayers = new this.mapControl.esriModules.WebTileLayer(
      //   urlss +
      //     "?tk=44c2ef89d6e7337993d863653582d3b9&layer=SDRasterPubMap&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={level}&TileCol={col}&TileRow={row}",
      //   {
      //     tileInfo: this.mapControl.tileInfoWeb,
      //     spatialReference: this.mapControl.tileInfoWeb.spatialReference,
      //   }
      // );
      // // 添加天地图图层到地图中
      // this.mapControl.map.add(this.WebTileLayers);

      let extent = null;
      let center = null;
      if (this.Locationgraphic) {
        extent = this.Locationgraphic.geometry.extent;
        center = this.Locationgraphic.geometry.extent.center;
      } else {
        extent = this.mapView.extent;
        center = this.mapView.center;
      }
      if (urlss) {
        this.$refs.mapControl.creatLayer(
          urlss,
          "zdy",
          "",
          center,
          extent,
          this.mapView.zoom
        );
      } else {
        this.$refs.mapControl.creatLayer(
          "",
          "defaultMap",
          "",
          center,
          extent,
          this.mapView.zoom
        );
      }
    },
    removeWebTileLayer() {
      if (this.WebTileLayers) {
        this.mapControl.map.remove(this.WebTileLayers);
      }
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
      let url = "";
      let layer = null;
      if (eve.maptype == "FeatureLayer") {
        url = eve.url + "/" + eve.layerid;
        layer = new this.mapControl.esriModules.FeatureLayer({
          url: url,
          outFields: ["*"],
        });
      } else if (eve.maptype == "MapImageLayer") {
        url = eve.url;
        layer = new this.mapControl.esriModules.MapImageLayer({
          url: url,
        });
      } else if (eve.maptype == "TileLayer") {
        url = eve.url;
        layer = new this.mapControl.esriModules.TileLayer({
          url: url,
        });
      } else if (eve.maptype == "WMTSLayer") {
        url = eve.url;
        layer = new this.mapControl.esriModules.WMTSLayer({
          url: url,
          sublayers: [{ id: eve.layerid }],
        });
      } else {
        return;
      }

      this.servicelayers.push(layer);
      // 将FeatureLayer添加到Map视图中
      this.mapControl.map.add(layer, -1);
      this.querylayerextent(eve.url + "/" + eve.layerid); // 查询图层范围并缩放到该范围
    },
    addordeletlayer(eve) {
      if (eve.isshow) {
        this.addservicelayer(eve);
      } else {
        let indexs = null;
        if (eve.maptype == "MapImageLayer") {
          indexs = this.servicelayers.findIndex(
            (element) => element.url == eve.url
          );
        } else if (eve.maptype == "WMTSLayer") {
          indexs = this.servicelayers.findIndex(
            (element) =>
              element.url == eve.url &&
              parseInt(eve.layerid) === element.layerId
          );
        } else if (eve.maptype == "FeatureLayer") {
          indexs = this.servicelayers.findIndex(
            (element) =>
              element.url == eve.url &&
              parseInt(eve.layerid) === element.layerId
          );
        } else if (eve.maptype == "TileLayer") {
          indexs = this.servicelayers.findIndex(
            (element) =>
              element.url == eve.url &&
              parseInt(eve.layerid) === element.layerId
          );
        }
        if (indexs < 0) {
          return;
        }
        this.mapControl.map.remove(this.servicelayers[indexs]);
        this.servicelayers.splice(indexs, 1);
      }
    },
    querylayerextent(layerUrl) {
      const queryTask = new this.mapControl.esriModules.QueryTask({
        url: layerUrl,
      });
      const query = new this.mapControl.esriModules.Query();
      query.returnGeometry = true;
      query.where = "1=1"; // 查询所有要素
      query.outSpatialReference = this.mapView.spatialReference; // 和 mapView 保持一致
      query.num = 50; // 只查前 50 个，防止数据量太大卡死
      queryTask
        .execute(query)
        .then((result) => {
          // 过滤掉没有几何的要素
          const validFeatures = result.features.filter(
            (f) => f.geometry && f.geometry.extent
          );
          if (validFeatures.length === 0) {
            console.warn("查询结果中无有效几何");
            return;
          }
          // 获取所有几何的 extent 并合并
          let extent = validFeatures[0].geometry.extent.clone();
          for (let i = 1; i < validFeatures.length; i++) {
            extent = extent.union(validFeatures[i].geometry.extent);
          }
          // 放大后定位
          this.zoomTo(extent.expand(2.2), null, 500);
        })
        .catch((err) => {
          console.error("execute 查询失败", err);
        });
    },
    closeservice() {
      if (this.servicelayers.length > 0) {
        this.servicelayers.forEach((element) => {
          this.mapControl.map.remove(element);
        });
        this.servicelayers = [];
      }
    },
    addpatropeoplelayer(eve) {
      this.patropeoplelayer.removeAll();
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: eve.rings,
        spatialReference: this.mapControl.mapView.spatialReference,
      });
      var graphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        attributes: {
          priority: 1, // 较低优先级
        },
        symbol: {
          type: "simple-fill", // casts as SimpleFillSymbol
          color: [0, 255, 10, 0.1],
          style: "solid",
          outline: {
            // casts as SimpleLineSymbol
            color: [0, 255, 10, 1],
            width: 2,
          },
        },
      });
      const point = {
        type: "point",
        longitude: polygon.extent.center.x,
        latitude: polygon.extent.center.y,
        spatialReference: this.mapView.spatialReference,
      };
      // 创建图标符号
      const symbol = {
        type: "picture-marker",
        url: require("@/assets/image/online-person.png"),
        width: "24px",
        height: "24px",
      };
      // 创建点位图形
      const graphicpoint = new this.mapControl.esriModules.Graphic({
        geometry: point,
        symbol: symbol,
        attributes: {
          priority: 2, // 较低优先级
        },
      });
      this.patropeoplelayer.addMany([graphic, graphicpoint]);
      this.zoomTo(graphic, null, 500);
      // this.patropeoplelayer.add(graphic);
      // this.patropeoplelayer.add(graphicpoint);
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
     * 判断是否在国内不在国内则不做偏移
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
      var _this = this;
      this.mapControl = esriMapControl;
      this.mapView = esriMapControl.mapView;
      this.ArrowGrahicLayer = new this.mapControl.esriModules.GraphicsLayer();
      this.GraphicalLocationLayer =
        new this.mapControl.esriModules.GraphicsLayer();
      this.analysisdatalayer = new this.mapControl.esriModules.GraphicsLayer();
      this.patropeoplelayer = new this.mapControl.esriModules.GraphicsLayer({
        orderBy: {
          field: "priority",
          order: "descending",
        },
      });
      this.smallGraphicLayer = new this.mapControl.esriModules.GraphicsLayer({
        id: "smallGraphicLayer",
        title: "小图标图层",
      });
      this.drawGraphicalLayer = new this.mapControl.esriModules.GraphicsLayer({
        id: "drawGraphicalLayer",
        title: "绘制图层",
      });
      this.mapControl.map.add(this.analysisdatalayer, 9);
      this.mapControl.map.add(this.patropeoplelayer, 3);
      this.mapControl.map.add(this.GraphicalLocationLayer, 10);
      this.mapControl.map.add(this.ArrowGrahicLayer, 3);
      this.mapControl.map.add(this.smallGraphicLayer, 3);
      this.mapControl.map.add(this.drawGraphicalLayer, 11);
      _this.mapView.popup.dockOptions = {
        buttonEnabled: false, // 隐藏切换按钮
        breakpoint: false, // 不允许弹窗浮动
      };
      // _this.mapView.on("click", function (event) {
      //   _this.mapView.hitTest(event).then(function (response) {
      //     if (response.results[0]) {
      //       if (response.results[0].graphic.attributes.type == "online") {
      //       } else {
      //         _this.MapclickArrow(response.results[0]);
      //       }
      //     }
      //   });
      // });

      this.mapControl.mapView.on("click", async (event) => {
        const response = await this.mapControl.mapView.hitTest(event);
        if (response.results[0]) {
          if (!response.results[0].graphic.attributes) {
            return;
          }
          if (response.results[0].graphic.attributes.type == "online") {
            if (response.results.length) {
              const graphics = response.results
                .map((result) => result.graphic)
                .filter((graphic) => graphic.layer === this.onlineLayer);

              // 获取第一个点位或根据逻辑选择一个
              const selectedGraphic = graphics[0];
              if (selectedGraphic) {
                this.mapControl.mapView.popup.open({
                  location: selectedGraphic.geometry,
                  title: selectedGraphic.popupTemplate.title,
                  content: selectedGraphic.popupTemplate.content({
                    graphic: selectedGraphic,
                  }),
                });
                window.OnlinePersonnelInfo = selectedGraphic.attributes;
              }
            }
          } else if (
            response.results[0].graphic.attributes.type == "smallgraphic"
          ) {
            if (response.results.length) {
              const graphics = response.results
                .map((result) => result.graphic)
                .filter((graphic) => graphic.layer === this.smallGraphicLayer);

              // 获取第一个点位或根据逻辑选择一个
              if (this.selectedSmallGraphic) {
                this.selectedSmallGraphic.symbol =
                  this.defaultSmallGraphicSymbol;
              }

              if (graphics[0]) {
                graphics[0].symbol = this.selectedSmallGraphicSymbol;
                this.selectedSmallGraphic = graphics[0];
              }
            }
          } else {
            this.MapclickArrow(response.results[0]);
          }
        }
      });
      // 以济南历下区中心点为基准
      const centerLng = 117.0889;
      const centerLat = 36.2006;

      // 随机偏移范围（约 0.01 度 ≈ 1km）
      const offset = 0.02;

      this.$emit("initCompleted", this);
      setTimeout(() => {
        this.onlineLayer = null;
        this.QrCodeLayer = null;
        this.initQrCodeLayer();
        this.initOnlineLayer();
        this.initBoundaryLayers(); // 初始化边界图层
      }, 0);
    },
    // 初始化在线人员图层
    initOnlineLayer() {
      if (!this.onlineLayer && this.mapControl) {
        this.onlineLayer = new this.mapControl.esriModules.GraphicsLayer({
          id: "onlineLayer",
          title: "在线人员图层",
          visible: false,
        });
        this.mapControl.map.add(this.onlineLayer, 10);
      }
    },
    async initQrCodeLayer() {
      if (!this.QrCodeLayer && this.mapControl) {
        this.QrCodeLayer = await new this.mapControl.esriModules.GraphicsLayer({
          id: "QrCodeLayer",
          title: "二维码图层",
          visible: false,
        });
        this.mapControl.map.add(this.QrCodeLayer, 10);
        if (this.qrcodedata && this.qrcodedata.length > 0) {
          this.updateQrCodeData(this.qrcodedata);
        }
      }
    },
    //更新二维码数据
    updateQrCodeData(data) {
      if (!this.QrCodeLayer) {
        this.initQrCodeLayer();
      }
      this.qrcodedata = data;
      // 清除现有点位
      this.QrCodeLayer.removeAll();
      // 添加新的点位
      data.forEach((person) => {
        var polygon = new this.mapControl.esriModules.Polygon({
          rings: JSON.parse(person.shape).rings,
          spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
        });
        const point = {
          type: "point",
          longitude: polygon.extent.center.x,
          latitude: polygon.extent.center.y,
          spatialReference: this.mapView.spatialReference,
        };
        person["type"] = "qrcode";
        person["url"] = "";

        // 创建图标符号
        let symbol = null;
        if (person.codestatus == 1) {
          symbol = this.greenQrCodeSymbol;
        } else if (person.codestatus == 2) {
          symbol = this.yellowQrCodeSymbol;
        } else if (person.codestatus == 3) {
          symbol = this.redQrCodeSymbol;
        }
        // 创建点位图形
        const graphic = new this.mapControl.esriModules.Graphic({
          geometry: point,
          symbol: symbol,
          attributes: person,
          popupTemplate: {
            title: `<div style="font-size: 16px; font-weight: 600; color: #0056b3; padding: 8px 0; border-bottom: 2px solid #e8f0fe;">${person.villagename}</div>`,
            content: ({ graphic }) => {
              var color = "";
              if (graphic.attributes.codestatus == 1) {
                color = "#07B700";
              } else if (graphic.attributes.codestatus == 2) {
                color = "#C5DE1B";
              } else if (graphic.attributes.codestatus == 3) {
                color = "#DA0808";
              }
              var qrcodeimg = "";
              QRCode.toDataURL(
                "http://1.94.43.37:9923/qrcode?xzqdm=" +
                  graphic.attributes.villagecode,
                {
                  width: 80,
                  color: {
                    dark: color, // 二维码前景色（默认黑色）
                    light: "#fff", // 背景色（默认白色）
                  },
                },
                function (err, url) {
                  if (err) console.error(err);
                  else qrcodeimg = url;
                  console.log(url); // Base64 格式的二维码图片
                }
              );
              return `
                <div style="padding: 10x;">
                <img src="${qrcodeimg}" style="width: 100px; height: 100px; margin: 0 auto; display: block;"/>
                </div>
              `;
            },
            outFields: ["*"],
            overwriteActions: true,
            dockEnabled: false,
            collapsed: false,
            collapseEnabled: false,
            expandEnabled: false,
            actions: [],
          },
        });

        this.QrCodeLayer.add(graphic);
      });
    },
    // 更新在线人员位置
    updateOnlinePersonnel(data) {
      if (!this.onlineLayer) {
        this.initOnlineLayer();
      }
      // 清除现有点位
      this.onlineLayer.removeAll();
      // 添加新的点位
      data.forEach((person) => {
        const point = {
          type: "point",
          longitude: person.lon,
          latitude: person.lat,
          spatialReference: this.mapView.spatialReference,
        };
        person["type"] = "online";
        // 创建图标符号
        const symbol = {
          type: "picture-marker",
          url: require("@/assets/image/online-person.png"),
          width: "24px",
          height: "24px",
        };

        // 创建点位图形
        const graphic = new this.mapControl.esriModules.Graphic({
          geometry: point,
          symbol: symbol,
          attributes: person,
          popupTemplate: {
            title: `<div style="font-size: 16px; font-weight: 600; color: #0056b3; padding: 8px 0; border-bottom: 2px solid #e8f0fe;">在线人员信息</div>`,
            content: ({ graphic }) => {
              const person = graphic.attributes;
              window.OnlinePersonnelInfo = graphic.attributes;
              return `
                <div style="padding: 12px;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: rgba(232, 240, 254, 0.3); border-radius: 4px;">
                    <i class="el-icon-user" style="color: #0056b3; margin-right: 8px; font-size: 16px;"></i>
                    <span style="color: #666; margin-right: 5px; font-size: 13px;">姓名：</span>
                    <span style="color: #333; font-size: 13px;">${
                      person.appusername
                    }</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: rgba(232, 240, 254, 0.3); border-radius: 4px;">
                    <i class="el-icon-phone" style="color: #0056b3; margin-right: 8px; font-size: 16px;"></i>
                    <span style="color: #666; margin-right: 5px; font-size: 13px;">电话：</span>
                    <span style="color: #333; font-size: 13px;">${
                      person.appphone
                    }</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: rgba(232, 240, 254, 0.3); border-radius: 4px;">
                    <i class="el-icon-location" style="color: #0056b3; margin-right: 8px; font-size: 16px;"></i>
                    <span style="color: #666; margin-right: 5px; font-size: 13px;">位置：</span>
                    <span style="color: #333; font-size: 13px;">${
                      person.address || "暂无"
                    }</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 8px; background: rgba(232, 240, 254, 0.3); border-radius: 4px;">
                    <i class="el-icon-time" style="color: #0056b3; margin-right: 8px; font-size: 16px;"></i>
                    <span style="color: #666; margin-right: 5px; font-size: 13px;">更新时间：</span>
                    <span style="color: #333; font-size: 13px;">${
                      person.updatetime || "暂无"
                    }</span>
                  </div>
                  <div style="text-align: center; margin-top: 12px;">
                    <button 
                      id="onlineButton"
                      onclick="triggerVideoCallEvent()"
                      style="
                        background: #409EFF;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto;
                        font-size: 14px;
                      "
                    >
                      <i class="el-icon-video-camera" style="margin-right: 5px;"></i>
                      视频通话
                    </button>
                  </div>
                </div>
              `;
            },
            outFields: ["*"],
            overwriteActions: true,
            dockEnabled: false,
            collapsed: false,
            collapseEnabled: false,
            expandEnabled: false,
            actions: [],
          },
        });

        this.onlineLayer.add(graphic);
      });
    },

    // 控制图层显示/隐藏
    toggleOnlineLayer(visible) {
      if (this.onlineLayer) {
        this.onlineLayer.visible = visible;
      }
    },

    // 控制二维码图层显示/隐藏
    toggleQrCodeLayer(visible) {
      if (this.QrCodeLayer) {
        this.QrCodeLayer.visible = visible;
      }
    },
    // 在组件销毁时清理图层
    destroyOnlineLayer() {
      if (this.onlineLayer) {
        this.mapControl.map.remove(this.onlineLayer);
        this.onlineLayer = null;
      }
    },

    triggerVideoCallEvent() {
      try {
        console.log("开始视频通话", EventBus);
        EventBus.$emit("startVideoCall", window.OnlinePersonnelInfo);
      } catch (error) {
        console.log(error);
      }
    },

    // 初始化管理边界图层
    initBoundaryLayer() {
      if (!this.boundaryLayer && this.mapControl) {
        // 创建 FeatureLayer
        this.boundaryLayer = new this.mapControl.esriModules.FeatureLayer({
          url: "http://1.94.43.37:6080/arcgis/rest/services/tzz_jy_xzqh/MapServer/0",
          id: "boundaryLayer",
          title: "管理边界图层",
          opacity: 0.8,
          visible: false,
          outFields: ["*"],
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-fill",
              color: [0, 255, 255, 0.2],
              outline: {
                color: [0, 255, 255],
                width: 2,
              },
            },
          },
        });

        this.mapControl.map.add(this.boundaryLayer, 5);
      }
    },

    // 控制边界图层显示/隐藏
    toggleBoundaryLayer(visible) {
      if (this.boundaryLayer) {
        this.boundaryLayer.visible = visible;
      }
    },

    // 销毁边界图层
    destroyBoundaryLayer() {
      if (this.boundaryLayer) {
        this.mapControl.map.remove(this.boundaryLayer);
        this.boundaryLayer = null;
      }
    },

    // 初始化所有边界图层
    initBoundaryLayers() {
      if (this.boundaryLayers.length === 0 && this.mapControl) {
        // 图层配置
        const layerConfigs = [
          {
            id: 0,
            title: "村级边界",
            color: [0, 255, 255, 0.15], // 青色，较低透明度
            outlineColor: [0, 255, 255],
            outlineWidth: 1.5,
          },
          {
            id: 1,
            title: "镇级边界",
            color: [255, 215, 0, 0.1], // 金色，中等透明度
            outlineColor: [255, 215, 0],
            outlineWidth: 2,
          },
          {
            id: 2,
            title: "区级边界",
            color: [147, 112, 219, 0.08], // 紫色，较高透明度
            outlineColor: [147, 112, 219],
            outlineWidth: 2.5,
          },
        ];

        // 创建所有图层
        layerConfigs.forEach((config) => {
          const layer = new this.mapControl.esriModules.FeatureLayer({
            url: `http://1.94.43.37:6080/arcgis/rest/services/tzz_jy_xzqh/MapServer/${config.id}`,
            id: `boundaryLayer_${config.id}`,
            title: config.title,
            opacity: 0.9,
            visible: false,
            outFields: ["*"],
            renderer: {
              type: "simple",
              symbol: {
                type: "simple-fill",
                color: config.color,
                outline: {
                  color: config.outlineColor,
                  width: config.outlineWidth,
                  style: "solid",
                },
                style: "solid",
              },
            },
          });

          this.boundaryLayers.push(layer);
          this.mapControl.map.add(layer, 5);
        });
      }
    },

    // 控制所有边界图层显示/隐藏
    toggleBoundaryLayers(visible) {
      this.boundaryLayers.forEach((layer) => {
        layer.visible = visible;
      });
    },
    //查询空间查询济阳区问题图斑
    async queryProblemPolygon(shapedata, servicedata) {
      var _this = this;
      if (!_this.mapControl) {
        return;
      }
      if (!_this.mapControl.esriModules) {
        return;
      }
      if (!shapedata) {
        return;
      }
      if (!servicedata) {
        return;
      }
      let url = servicedata.filter((item) => {
        return item.typecode == 3;
      });
      var identifyTask = new _this.mapControl.esriModules.IdentifyTask(
        url[0].serviceurl
      );
      let data = [];
      const promises = shapedata.map(async (element) => {
        let shap = window.JSON.parse(element.shape);
        var polygon = new _this.mapControl.esriModules.Polygon({
          rings: shap.rings,
          spatialReference: { wkid: 4326 }, // 坐标系必须跟当前 view 的坐标系一致
        });
        var params = new _this.mapControl.esriModules.IdentifyParameters();
        params.returnGeometry = true;
        params.layerIds = [0];
        params.tolerance = 0;
        params.layerOption = "LAYER_OPTION_ALL";
        params.mapExtent = _this.mapControl.mapView.extent;
        params.geometry = polygon;

        let res = await identifyTask.execute(params);
        let shapdata = res.results;
        if (shapdata.length > 0) {
          shapdata.forEach((item) => {
            let obj = {};
            let shaps = {};
            shaps["rings"] = item.feature.geometry.rings;
            shaps["spatialReference"] = { wkid: "4326" };
            obj["cjdm"] = element.villagecode;
            obj["cjmc"] = element.villagename;
            obj["tbbh"] = item.feature.attributes.TBBH;
            obj["sdqk"] = item.feature.attributes["实地情况"];
            obj["shape"] = window.JSON.stringify(shaps);
            data.push(obj);
          });
        }
      });
      // 等待所有异步操作完成
      await Promise.all(promises);
      // 确保此时 data 已经填充完毕
      console.log("问题图斑数据：", data);
      return data;
      // Promise.all([p2, p3]).then((datas) => {
      //   if (datas[0] != 0 && datas[1] != 0) {
      //     let data = datas[0];
      //     let url = datas[1][0];
      //     var insertdata = [];

      //     Promise.all(insertdata).then((datas) => {
      //       if (datas.length > 0) {
      //         let para = [];
      //         datas.forEach((items) => {
      //           if (items != 0) {
      //             items.forEach((shapitem) => {
      //               para.push(shapitem);
      //             });
      //           }
      //         });
      //         _this.$http
      //           .post("zxjg/insOrUpdJKMRanking", para)
      //           .then((res) => {});
      //       }
      //     });
      //   }
      // });
    },
    // 添加MapImageLayer图层
    addMapImageLayer(url, layerid) {
      var mapImageLayer = new this.mapControl.esriModules.MapImageLayer({
        url: url,
        id: layerid,
        title: "MapImageLayer",
      });
      mapImageLayer.when(() => {
        const fullExtent = mapImageLayer.fullExtent;
        if (fullExtent) {
          this.mapView.goTo(fullExtent.expand(1.5)); // expand 放大 20%，以避免边缘被裁剪
        } else {
          console.warn("图层没有 fullExtent");
        }
      });
      this.servicelayers.push(mapImageLayer);
      this.mapControl.map.add(mapImageLayer, 1);
    },
    // 移除MapImageLayer图层
    removeMapImageLayer(url) {
      let indexs = this.servicelayers.findIndex((item) => {
        return item.url === url;
      });
      if (indexs != -1) {
        this.mapControl.map.remove(this.servicelayers[indexs]);
        this.servicelayers.splice(indexs, 1);
      }
    },
    async Analyzethecurrentsituation(rings, serverUrl) {
      return new Promise((resolve, reject) => {
        var geometryService = new this.mapControl.esriModules.GeometryService(
          "https://sdzrzy.cn:9912/arcgisproxy/rest/services/Utilities/Geometry/GeometryServer/"
        );
        var polygon = new this.mapControl.esriModules.Polygon({
          rings: rings,
          spatialReference: this.mapView.spatialReference,
        });
        const graphics = new this.mapControl.esriModules.Graphic({
          geometry: polygon,
          symbol: {
            type: "simple-fill",
            color: [125, 125, 242, 1],
            style: "solid",
            outline: {
              color: [125, 125, 242, 1],
              width: 0,
            },
          },
        });
        // this.mapView.graphics.add(graphics);
        var queryPara = new this.mapControl.esriModules.Query();
        queryPara.geometry = polygon;
        queryPara.returnGeometry = true;
        queryPara.outFields = ["*"];
        queryPara.spatialRelationship =
          this.mapControl.esriModules.Query.SPATIAL_REL_INTERSECTS;
        var queryTask = new this.mapControl.esriModules.QueryTask(serverUrl);

        queryTask
          .execute(queryPara)
          .then(async (res) => {
            var features = res.features;
            if (features && features.length > 0) {
              debugger;
              const color = [
                {
                  center: [125, 125, 242, 1],
                  outline: [244, 33, 255, 1],
                },
                {
                  center: [15, 255, 0, 1],
                  outline: [14, 123, 215, 1],
                },
                {
                  center: [255, 155, 0, 1],
                  outline: [144, 33, 55, 1],
                },
              ];
              let allarea = 0;
              let colorindex = 0;
              for (let index = 0; index < features.length; index++) {
                if (index > color.length - 1) {
                  colorindex = index % color.length; // 循环使用颜色
                }
                const element = features[index];
                const originArea = this.calcatArea(element.geometry.rings);
                try {
                  const insertdata = await geometryService.intersect(
                    [element.geometry],
                    polygon
                  );
                  if (insertdata && insertdata[0]) {
                    const intersectedGeometry = insertdata[0];
                    const intersectArea = this.calcatArea(
                      intersectedGeometry.rings
                    );
                    allarea += intersectArea;

                    const graphic = new this.mapControl.esriModules.Graphic({
                      attributes: {
                        DLMC: element.attributes.DLMC,
                        area: intersectArea,
                        originArea: originArea,
                      },
                      geometry: element.geometry,
                      symbol: {
                        type: "simple-fill",
                        color: color[colorindex].center,
                        style: "solid",
                        outline: {
                          color: color[colorindex].outline,
                          width: 0,
                        },
                      },
                    });
                    this.dlgraphicdatas.push(graphic);
                    this.analysisdatalayer.add(graphic);
                  } else {
                    console.warn("未相交:", element.attributes.DLMC);
                  }
                } catch (error) {
                  console.error(
                    "计算相交出错:",
                    element.attributes.DLMC,
                    error
                  );
                }
              }
              this.dlgraphicdatas.forEach((element) => {
                const labelGraphic = new this.mapControl.esriModules.Graphic({
                  geometry: {
                    type: "point",
                    longitude: element.geometry.extent.center.x,
                    latitude: element.geometry.extent.center.y,
                  },
                  symbol: new this.mapControl.esriModules.TextSymbol({
                    color: "white",
                    text: element.attributes.DLMC,
                    font: {
                      size: 12,
                      family: "sans-serif",
                      weight: "bold",
                    },
                    haloColor: "black",
                    haloSize: 1,
                    yoffset: -15, // 垂直偏移，使标签显示在点上方
                  }),
                });
                this.analysisdatalayer.add(labelGraphic);
              });
              const resultArea = this.calcatArea(polygon.rings);
              resolve(resultArea); // ✅ 返回结果，外部可 await 获取
            } else {
              resolve(0); // ✅ 无结果也 resolve，以防卡住
            }
          })
          .catch((res) => {
            console.log("分析失败", res);
            reject(res); // ✅ 出错 reject，便于外部捕获
          });
      });
    },
    //定位分析图斑
    Locationgeometrys() {
      let data =
        "39560681.61463295 3989531.8113436927, 39560549.32270169 3989280.4566743076, 39560311.19722544 3989386.2902193125, 39560231.82206668 3989730.24924058, 39560681.61463295 3989531.8113436927";
      let arrdata = data.split(",");
      let rings = [];
      for (let index = 0; index < arrdata.length; index++) {
        const element = arrdata[index];
        if (index === 0) {
          continue;
        }
        let newStr = element.substring(1);
        arrdata[index] = newStr;
      }
      const datas = arrdata.map((item) => {
        let arr = item.split(" ");
        return this.coordinateConvert(arr[0], arr[1]);
      });
      // let datas = [];
      // for (let i = 0; i < rings.length; i++) {
      //   const element = rings[i];
      //   let arr = element.map((item) => {
      //     return this.coordinateConvert(item[0], item[1]);
      //   });
      //   datas.push(arr);
      // }
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: [datas],
        // rings: datas,
        spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
      });
      var graphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // casts as SimpleFillSymbol
          color: [155, 255, 0, 1],
          style: "solid",
          outline: {
            // casts as SimpleLineSymbol
            color: [44, 123, 215, 1],
            width: 2,
          },
        },
      });
      console.log(this.calcatArea([datas]));

      this.mapView.graphics.add(graphic);

      // console.log(datas);
    },
    // 添加小图斑
    addSmallGraphic(geometry, color, labelText) {
      if (this.smallGraphicLayer) {
        var polygon = new this.mapControl.esriModules.Polygon({
          rings: geometry.rings,
          spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
        });
        if (!color) {
          color = [255, 0, 0];
        }
        this.defaultSmallGraphicSymbol.outline.color = color;
        var Graphic = new this.mapControl.esriModules.Graphic({
          geometry: polygon,
          symbol: this.defaultSmallGraphicSymbol,
          attributes: {
            labelText: labelText,
            type: "smallgraphic",
          },
        });

        // 创建文本标签
        const labelGraphic = new this.mapControl.esriModules.Graphic({
          geometry: {
            type: "point",
            longitude: polygon.extent.center.x,
            latitude: polygon.extent.center.y,
          },
          symbol: new this.mapControl.esriModules.TextSymbol({
            color: "white",
            text: labelText,
            font: {
              size: 12,
              family: "sans-serif",
              weight: "bold",
            },
            haloColor: "black",
            haloSize: 1,
            yoffset: -15, // 垂直偏移，使标签显示在点上方
          }),
        });
        if (this.mapView.graphics._items.length > 0) {
          this.mapView.graphics._items.forEach((element) => {
            this.mapView.graphics.remove(element);
          });
        }
        this.smallGraphicLayer.add(Graphic);
        this.smallGraphicLayer.add(labelGraphic);
      }
    },
    // 删除小图斑
    removeSmallGraphic() {
      if (this.smallGraphicLayer) {
        this.smallGraphicLayer.removeAll();
      }
    },
    //动态绘制线
    drawpolyline() {
      this.drowLine();
    },
    //面积测量
    areaMeasurement() {
      this.mapControl.areaMeasurement();
    },
    //销毁绘制
    destroyDraw() {
      if (this.mapControl && this.mapControl.destroyDraw) {
        this.mapControl.destroyDraw();
      }
    },
    // 清除绘制图层
    cleardrawlayer() {
      if (this.mapControl) {
        this.mapControl.removedraw();
      }
    },
    //拉框
    drawRectangle(para, callback) {
      let tableData = [];
      this.mapControl.startrectangle(para, (val) => {
        this.FeatureLayerquery({
          url: this.queryUrl,
          where: "1=1",
          outFields: ["*"],
          geometry: val,
          spatialRelationship: "intersects",
        })
          .then((res) => {
            if (res.features.length > 0) {
              let obj = {};
              res.features.forEach((element) => {
                obj = {
                  ...element.attributes,
                  geometry: element.geometry,
                };
                tableData.push(obj);
              });
              callback(tableData);
            } else {
            }
          })
          .catch((error) => {
            console.error("查询失败:", error);
          });
      });
    },
    // 绘制点
    drawpoint(para, callback) {
      this.mapControl.startDrawpoint(para, (val, point) => {
        this.FeatureLayerquery({
          url: this.queryUrl,
          where: "1=1",
          outFields: ["*"],
          geometry: val,
          spatialRelationship: "intersects",
        })
          .then((res) => {
            if (res.features.length > 0) {
              this.mapControl.addle;
              var geomertry = res.features[0].geometry;
              this.selectedGraphic(res.features[0].attributes, geomertry);
              callback(res.features);
              // 处理查询结果
            } else {
              // 没有查询到结果
            }
          })
          .catch((error) => {
            console.error("查询失败:", error);
          });
      });
    },
    // 绘制多边形
    drawPolygonQuer(para, callback) {
      let tableData = [];
      this.mapControl.startDrawpolygon(para, (val) => {
        this.FeatureLayerquery({
          url: this.queryUrl,
          where: "1=1",
          outFields: ["*"],
          geometry: val,
          spatialRelationship: "intersects",
        })
          .then((res) => {
            if (res.features.length > 0) {
              let obj = {};
              res.features.forEach((element) => {
                obj = {
                  ...element.attributes,
                  geometry: element.geometry,
                };
                tableData.push(obj);
              });
              callback(tableData);
            } else {
            }
          })
          .catch((error) => {
            console.error("查询失败:", error);
          });
      });
    },
    // 获取字段信息
    getfileds(callback) {
      setTimeout(() => {
        this.FeatureLayerquery({
          url: this.queryUrl,
          where: "1=1",
          geometry: null,
          spatialRelationship: "intersects",

          returnGeometry: false,
        })
          .then((res) => {
            if (res.fields.length > 0) {
              const fields = res.fields.map((field) => field.name);
              callback(fields);
            } else {
              callback([]);
            }
          })
          .catch((error) => {
            console.error("查询失败:", error);
          });
      }, 10);
    },
    // 执行空间查询
    FeatureLayerquery({
      url,
      where = "1=1",
      outFields,
      geometry,
      spatialRelationship = "intersects",
      returnGeometry = true,
    }) {
      let _this = this;
      return new Promise((resolve, reject) => {
        const queryTask = new _this.mapControl.esriModules.QueryTask({
          url: url,
        });
        const query = new _this.mapControl.esriModules.Query();
        query.where = where;
        query.outFields = ["*"];
        query.geometry = geometry;
        query.spatialRelationship = spatialRelationship;
        query.returnGeometry = returnGeometry;

        queryTask
          .execute(query)
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    selectedGraphic(attributes, geomertry) {
      this.drawGraphicalLayer.removeAll();
      this.mapView.popup.close();
      const location = geomertry.extent.center;
      location.x + 0.0015;
      var polygon = new this.mapControl.esriModules.Polygon({
        rings: geomertry.rings,
        spatialReference: this.mapView.spatialReference, //坐标系必须跟当前view的坐标系一致，否则添加不上
      });
      const fieldInfos = Object.keys(attributes).map((key) => ({
        fieldName: key,
        label: key,
      }));
      var selectedGraphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // casts as SimpleFillSymbol
          color: [255, 255, 0, 0.3],
          style: "solid",
          outline: {
            // casts as SimpleLineSymbol
            color: [255, 255, 0],
            width: 2,
          },
        },
        attributes: attributes,
        popupTemplate: {
          title: "图形信息",
          content: [
            {
              type: "fields",
              fieldInfos: fieldInfos,
            },
          ],
        },
      });

      this.drawGraphicalLayer.add(selectedGraphic);
      this.mapView.popup.open({
        features: [selectedGraphic],
        location: location, // 弹窗位置
      });
      this.zoomTo(location, null, 500, 15);
    },
    async queryByAttribute(val, callback) {
      let condition = "";
      let tableData = [];
      if (val.condition) {
        condition = " AND " + val.condition;
      }
      const webMercatorwgs = new this.mapControl.esriModules.SpatialReference({
        wkid: 4326,
      });
      this.removedrawGraphicsLayermapindex(); // 清除绘制图层
      this.mapControl.destroyDraw();
      if (!this.mapControl.esriModules.projection.isLoaded()) {
        await this.mapControl.esriModules.projection.load();
      }
      this.FeatureLayerquery({
        url: this.queryUrl,
        where: "1=1" + condition,
        outFields: ["*"],
      })
        .then((res) => {
          if (res.features.length > 0) {
            let obj = {};
            res.features.forEach((element) => {
              // 将 polygon 投影为线性坐标系
              const Polygon = this.mapControl.esriModules.projection.project(
                element.geometry,
                webMercatorwgs
              );
              obj = {
                ...element.attributes,
                geometry: Polygon,
              };
              tableData.push(obj);
            });
            callback(tableData);
          } else {
          }
        })
        .catch((error) => {
          callback(tableData);
          this.$message.error("查询失败:" + error.message);
          console.error("查询失败:", JSON.stringify(error));
        });
    },
    removedrawGraphicsLayermapindex() {
      this.mapControl.drawGraphicsLayermapindex.removeAll();
    },
    //聚合函数
    polymerization(data) {
      if (this.polymerizationgraphicsLayer) {
        this.polymerizationgraphicsLayer.removeAll(); // 清空现有图形
      } else {
        this.polymerizationgraphicsLayer =
          new this.mapControl.esriModules.GraphicsLayer();
        this.mapControl.map.add(this.polymerizationgraphicsLayer);
      }
      if (this.zoomWatchHandle) {
        this.zoomWatchHandle.remove(); // 移除之前的监听
        this.zoomWatchHandle = null; // 重置监听句柄
      }
      // 生成 100 个点
      this.polymerizationdata = data;
      if (data.length === 0) {
        // this.$message.warning("没有可聚合的数据");
        return;
      }
      this.mapControl.map.add(this.polymerizationgraphicsLayer);
      const getClusterColor = (count) => {
        if (count == 1) return [45, 140, 240, 0.8]; // 蓝色
        if (count < 10) return [0, 255, 0, 0.8]; // 绿色
        if (count < 30) return [255, 165, 0, 0.8]; // 橙色
        if (count < 60) return [255, 215, 0, 0.8]; // 黄色
        return [255, 50, 50, 0.85]; // 红色
      };

      // 聚合逻辑
      const clusterPoints = (geometrys, view) => {
        this.polymerizationgraphicsLayer.removeAll(); // 清空现有图形
        const clusterRadius = 50; // 像素半径，控制聚合范围
        const clustered = [];

        // 遍历所有点，进行聚合
        geometrys.forEach((geometry) => {
          let attachment = { ...geometry };
          let shp = JSON.parse(geometry.shape);
          const polygon = new this.mapControl.esriModules.Polygon({
            rings: shp.rings,
            spatialReference: { wkid: 4326 }, // 确保坐标系一致
          });
          const point = {
            x: polygon.extent.center.x,
            y: polygon.extent.center.y,
            attributes: attachment, // 保留原始属性
          };
          let fieldInfos = [];
          for (let key in attachment) {
            if (key !== "shape") {
              fieldInfos.push({
                fieldName: key,
                label: key,
              });
            }
          }

          let added = false;
          for (let cluster of clustered) {
            const point1 = new this.mapControl.esriModules.Point({
              longitude: point.x,
              latitude: point.y,
              spatialReference: { wkid: 4326 },
            });

            const point2 = new this.mapControl.esriModules.Point({
              longitude: cluster.x,
              latitude: cluster.y,
              spatialReference: { wkid: 4326 },
            });

            const screenPoint1 = this.mapView.toScreen(point1);
            const screenPoint2 = this.mapView.toScreen(point2);
            const distance = Math.sqrt(
              Math.pow(screenPoint1.x - screenPoint2.x, 2) +
                Math.pow(screenPoint1.y - screenPoint2.y, 2)
            );

            if (distance < clusterRadius) {
              // 将点加入现有聚合
              cluster.points.push(point);
              // 更新聚合点的坐标（取平均值，优化显示位置）
              cluster.x =
                (cluster.x * (cluster.points.length - 1) + point.x) /
                cluster.points.length;
              cluster.y =
                (cluster.y * (cluster.points.length - 1) + point.y) /
                cluster.points.length;
              added = true;
              break;
            }
          }
          if (!added) {
            // 创建新聚合点
            clustered.push({
              x: point.x,
              y: point.y,
              points: [point], // 存储聚合中的原始点
            });
          }
        });
        // 渲染聚合点
        clustered.forEach((cluster) => {
          const count = cluster.points.length; // 动态计算 count

          const markerSymbol =
            new this.mapControl.esriModules.SimpleMarkerSymbol({
              color: getClusterColor(count),
              size: Math.min(20 + count * 5, 50), // 根据数量调整大小
              outline: {
                color: [255, 255, 255],
                width: 0,
              },
            });

          const textSymbol = new this.mapControl.esriModules.TextSymbol({
            color: "white",
            text: String(count), // 显示聚合点数量
            font: { size: 12 },
            xoffset: 0,
            yoffset: -4,
          });

          const pointGraphic = new this.mapControl.esriModules.Graphic({
            geometry: {
              type: "point",
              longitude: cluster.x,
              latitude: cluster.y,
            },
            symbol: markerSymbol,
          });
          // this.mapView.goTo({
          //   target: pointGraphic.geometry,
          // });

          const textGraphic = new this.mapControl.esriModules.Graphic({
            geometry: {
              type: "point",
              longitude: cluster.x,
              latitude: cluster.y,
            },
            symbol: textSymbol,
          });

          this.polymerizationgraphicsLayer.addMany([pointGraphic, textGraphic]);
        });
      };

      // 初始渲染
      clusterPoints(this.polymerizationdata, this.mapView);

      // 监听地图缩放变化，重新聚合
      this.zoomWatchHandle = this.mapView.watch("zoom", (eve) => {
        console.log("当前缩放级别:", eve);
        if (eve > 10) {
          this.mapzoom = eve;
          this.polymerizationgraphicsLayer.removeAll(); // 缩放到10以下时清除聚合点
          this.polymerizationdata.forEach((geometry) => {
            let attachment = { ...geometry };
            let shp = JSON.parse(geometry.shape);
            delete attachment.shape;
            const polygon = new this.mapControl.esriModules.Polygon({
              rings: shp.rings,
              spatialReference: { wkid: 4326 }, // 确保坐标系一致
            });
            const fieldInfos = Object.keys(attachment).map((key) => ({
              fieldName: key,
              label: key,
            }));
            let param = { ...attachment };
            param.shape = JSON.stringify(shp);
            const strpara = JSON.stringify(param);
            let graphic = new this.mapControl.esriModules.Graphic({
              geometry: polygon,
              symbol: {
                type: "simple-fill", // casts as SimpleFillSymbol
                color: [255, 255, 0, 0],
                style: "solid",
                outline: {
                  // casts as SimpleLineSymbol
                  color: [255, 255, 0, 1],
                  width: 2,
                },
              },
              attributes: attachment, // 保留原始属性
              popupTemplate: {
                title: "图斑信息",
                // content: [
                //   {
                //     type: "fields",
                //     fieldInfos: fieldInfos,
                //   },
                // ],
                content: `
                <div class="popup-content">
                  <div class="info-item">
                    <i class="el-icon-location"></i>
                    <span class="label">市级行政区:</span>
                    <span class="value">${attachment.sjmc}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-document"></i>
                    <span class="label">县级行政区:</span>
                    <span class="value">${attachment.qjmc}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-info"></i>
                    <span class="label">乡级行政区:</span>
                    <span class="value">${attachment.xjmc}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-info"></i>
                    <span class="label">图斑编号:</span>
                    <span class="value">${attachment.tbbsm}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-info"></i>
                    <span class="label">项目用途:</span>
                    <span class="value">${attachment.purpose}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-info"></i>
                    <span class="label">使用核地认定结果:</span>
                    <span class="value">${attachment.judgeresult}</span>
                  </div>
                   <div class="info-item">
                    <i class="el-icon-info"></i>
                    <span class="label">变化原因:</span>
                    <span class="value">${attachment.causechange}</span>
                  </div>
                  <button id="goinfo-btn"   style="background: #409eff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size:12px;" onclick="goinfo('${attachment.guid}')">查看详情</button>
                  `,
              },
            });
            this.polymerizationgraphicsLayer.add(graphic);
          });
          return;
        }
        this.mapView.when(() => {
          clusterPoints(this.polymerizationdata, this.mapView);
        });
      });
    },
    drawArrowsss() {
      const center = { x: 117.123, y: 36.456 };
      const length = 0.02; // 箭头整体高度
      const width = 0.01; // 箭头整体宽度
      const tailRatio = 0.3; // 燕尾占箭头高度的比例
      const innerScale = 0.6; // 镂空比例（0.6 表示外形的60%尺寸）
      const outerRing = [
        [center.x, center.y + length / 2], // 顶点
        [center.x + width / 2, center.y], // 右中
        [center.x + width / 3, center.y - length * tailRatio], // 右下凹口
        [center.x + width / 2, center.y - length / 2], // 右下底
        [center.x - width / 2, center.y - length / 2], // 左下底
        [center.x - width / 3, center.y - length * tailRatio], // 左下凹口
        [center.x - width / 2, center.y], // 左中
        [center.x, center.y + length / 2], // 回到顶点闭合
      ];
      const innerRing = outerRing
        .map(([x, y]) => [
          center.x + (x - center.x) * innerScale,
          center.y + (y - center.y) * innerScale,
        ])
        .reverse(); // ArcGIS 内环必须逆时针
      const polygon = new this.mapControl.esriModules.Polygon({
        rings: [outerRing, innerRing],
        spatialReference: { wkid: 4326 },
      });

      const symbol = {
        type: "simple-fill",
        color: [255, 0, 0, 0.3],
        outline: {
          color: [255, 0, 0, 1],
          width: 2,
        },
      };

      const graphic = new this.mapControl.esriModules.Graphic({
        geometry: polygon,
        symbol: symbol,
      });

      this.mapView.graphics.add(graphic);
      this.zoomTo(graphic.extent, null, 500, 15); // 缩放到箭头位置
    },
    //卷帘对比
    drawRollerShutterComparison() {
      // 加载两个图层：影像图层 和 矢量图层
      const imageryLayer = new this.mapControl.esriModules.MapImageLayer({
        url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSYZT/MapServer",
        id: "0",
      });

      const streetLayer = new this.mapControl.esriModules.MapImageLayer({
        url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_2024XTSXZ/MapServer",
        id: "0",
      });
      this.mapControl.map.addMany([imageryLayer, streetLayer]);
      const swipe = new this.mapControl.esriModules.Swipe({
        view: this.mapView,
        leadingLayers: [imageryLayer],
        trailingLayers: [streetLayer],
        position: 50, // 初始位置百分比
        direction: "horizontal", // 可以设为 vertical 纵向卷帘
      });

      this.mapView.ui.add(swipe);
    },
  },

  beforeDestroy() {
    // 移除事件监听
    this.destroyOnlineLayer();
    this.destroyBoundaryLayer();
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

<style lang="scss">
/* 使用非 scoped 样式以便覆盖 ESRI 的弹窗样式 */
.esri-popup__main-container {
  max-width: 300px !important;

  .popup-title {
    font-size: 16px;
    font-weight: 600;
    color: #0056b3;
    padding: 8px 0;
    border-bottom: 2px solid #e8f0fe;
    margin-bottom: 10px;
  }

  .popup-content {
    padding: 5px;
    display: flex;
    align-items: center;
    flex-direction: column;

    .info-item {
      width: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 5px;
      background: rgba(232, 240, 254, 0.3);
      border-radius: 4px;

      &:hover {
        background: rgba(232, 240, 254, 0.6);
      }

      i {
        color: #0056b3;
        margin-right: 8px;
        font-size: 16px;
      }

      .label {
        color: #666;
        margin-right: 5px;
        font-size: 13px;
      }

      .value {
        color: #333;
        font-size: 13px;
        flex: 1;
      }
    }
  }
}

.esri-popup__header {
  background: #f8f9fa !important;
}

.esri-popup__content {
  margin: 0 !important;
  padding: 12px !important;
}

.esri-popup__footer {
  display: none !important;
}

/* 如果要隐藏所有按钮，只保留关闭按钮 */
.esri-popup__header-buttons {
  .esri-popup__button:not([aria-label="Close"]) {
    // display: none !important;
  }
}

/* 隐藏折叠按钮 */
.esri-popup__header-container button[aria-label="Collapse"] {
  display: none !important;
}

/* 添加视频通话按钮悬停效果 */
.esri-popup__content button:hover {
  background: #66b1ff !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.esri-popup__content button:active {
  background: #3a8ee6 !important;
}

/* 添加删除按钮悬停效果 */
.esri-popup__content button[style*="background: #F56C6C"]:hover {
  background: #f78989 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.esri-popup__content button[style*="background: #F56C6C"]:active {
  background: #dd6161 !important;
}

/* 完全禁用折叠功能 */
.esri-popup__header {
  .esri-popup__button[aria-label="Collapse"],
  .esri-popup__button[title="Collapse"] {
    display: none !important;
  }
}

.esri-popup--collapsed {
  display: none !important;
}

/* 移除之前的按钮样式覆盖 */
.esri-popup__header-buttons {
  /* 移除这个样式，让所有按钮显示 */
  .esri-popup__button:not([aria-label="Close"]) {
    // display: none !important;
  }
}

/* 只隐藏停靠和折叠按钮 */
.esri-popup__header-buttons {
  .esri-popup__button[title="Dock"],
  .esri-popup__button[aria-label="Dock"],
  .esri-popup__button[title="Collapse"],
  .esri-popup__button[aria-label="Collapse"] {
    display: none !important;
  }
}
</style>
