<template>
  <div style="width: 100%; height: 100%">
    <div ref="mapView" style="width: 100%; height: 100%"></div>
    <!-- <div ref="scenseView" style="width:50%;height:100%;float:right;border-radius: 0px 0px 10px 10px;"></div> -->
  </div>
</template>
<script>
import esriLoader from "esri-loader";
export default {
  name: "ComEsriMap",
  props: {
    methods: {},
    events: {},
  },
  data() {
    return {
      imageBase: null,
      imageBase2: null,
      map: null,
      mapView: null,
      tdtkey: "44c2ef89d6e7337993d863653582d3b9",
      esriModules: null,
      tileInfoWeb: {
        dpi: 96,
        rows: 256,
        cols: 256,
        compressionQuality: 0,
        origin: {
          x: -180,
          y: 90,
        },
        spatialReference: {
          wkid: 4490,
          latestWkid: 4326,
        },
        lods: [
          {
            level: 7,
            levelValue: 7,
            resolution: 0.010986328125,
            scale: 4622333.678978,
          },
          {
            level: 8,
            levelValue: 8,
            resolution: 0.0054931640625,
            scale: 2311166.839489,
          },
          {
            level: 9,
            levelValue: 9,
            resolution: 0.00274658203125,
            scale: 1155583.419744,
          },
          {
            level: 10,
            levelValue: 10,
            resolution: 0.001373291015625,
            scale: 577791.709872,
          },
          {
            level: 11,
            levelValue: 11,
            resolution: 0.0006866455078125,
            scale: 288895.854936,
          },
          {
            level: 12,
            levelValue: 12,
            resolution: 0.00034332275390625,
            scale: 144447.927468,
          },
          {
            level: 13,
            levelValue: 13,
            resolution: 0.000171661376953125,
            scale: 72223.963734,
          },
          {
            level: 14,
            levelValue: 14,
            resolution: 8.58306884765625e-5,
            scale: 36111.981867,
          },
          {
            level: 15,
            levelValue: 15,
            resolution: 4.291534423828125e-5,
            scale: 18055.990934,
          },
          {
            level: 16,
            levelValue: 16,
            resolution: 2.1457672119140625e-5,
            scale: 9027.995467,
          },
          {
            level: 17,
            levelValue: 17,
            resolution: 1.0728836059570313e-5,
            scale: 4513.997733,
          },
          {
            level: 18,
            levelValue: 18,
            resolution: 5.3644180297851563e-6,
            scale: 2256.998867,
          },
        ],
      },
      drawlayers: [],
      //内网地址
      // arcgisfontsUrl:
      //   "http://10.15.112.205:9902/arcgis/arcgis_font/arial-unicode-ms-regular",
      arcgisfontsUrl: "https://static.arcgis.com/fonts",
      options: {
        url: "https://js.arcgis.com/4.13/",
      },
      esriModulesPath: [
        "esri/Map",
        "esri/views/MapView",
        "esri/views/SceneView",
        "esri/Basemap",
        "esri/layers/WebTileLayer",
        "esri/geometry/projection",
        "esri/geometry/SpatialReference",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/geometry/support/webMercatorUtils",
        "esri/geometry/Point",
        "esri/geometry/Circle",
        "esri/tasks/support/Query",
        "esri/geometry/Extent",
        "esri/geometry/Polygon",
        "esri/core/watchUtils",
        "esri/widgets/BasemapToggle",
        "esri/widgets/BasemapGallery",
        "esri/widgets/Sketch",
        "esri/widgets/Sketch/SketchViewModel",
        "esri/widgets/Popup",
        'esri/widgets/Swipe',
        "esri/views/draw/Draw",
        "esri/geometry/geometryEngine",
        "esri/layers/WMSLayer",
        "esri/tasks/IdentifyTask",
        "esri/tasks/QueryTask",
        "esri/tasks/support/IdentifyParameters",
        "esri/tasks/GeometryService",
        "esri/tasks/support/BufferParameters",
        "esri/tasks/support/AreasAndLengthsParameters",
        "esri/layers/FeatureLayer",
        "esri/layers/TileLayer",
        "esri/layers/MapImageLayer",
        "esri/layers/VectorTileLayer",
        "esri/PopupTemplate",
        "esri/geometry/Polyline",
        "esri/config",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
      ],
      drawTool: null,
      rectangleGraphic: null, // 矩形绘制的图形
      startPoint: null, // 矩形绘制的起点
      endPoint: null, // 矩形绘制的终点\
      dragHandler: null, // 拖拽处理程序
      bufferGraphic: null, // 缓冲区图形
      drawGraphicsLayermapindex: null, // 绘制图形的图层
      sketch: null, // SketchViewModel 实例
    };
  },
  mounted() {
    let dturl = "https://service.sdmap.gov.cn/tileservice/sdrasterpubmap";
    this.creatLayer(dturl, "defaultMap", "", "");
  },
  methods: {
    creatLayer(layerUrl, mapType, dtscale, dtcenter, extent, newzoom) {
      let _this = this;
      _this.createCssLink(
        //内网地址
        "https://js.arcgis.com/4.13/esri/themes/light/main.css"
      );
      esriLoader
        .loadScript(_this.options)
        .then(() => {
          esriLoader
            .loadModules(_this.esriModulesPath)
            .then(
              ([
                Map,
                MapView,
                SceneView,
                Basemap,
                WebTileLayer,
                projection,
                SpatialReference,
                GraphicsLayer,
                Graphic,
                PictureMarkerSymbol,
                TextSymbol,
                SimpleMarkerSymbol,
                webMercatorUtils,
                Point,
                Circle,
                Query,
                Extent,
                Polygon,
                watchUtils,
                BasemapToggle,
                BasemapGallery,
                Sketch,
                SketchViewModel,
                Popup,
                Swipe,
                Draw,
                geometryEngine,
                WMSLayer,
                IdentifyTask,
                QueryTask,
                IdentifyParameters,
                GeometryService,
                BufferParameters,
                AreasAndLengthsParameters,
                FeatureLayer,
                TileLayer,
                MapImageLayer,
                VectorTileLayer,
                PopupTemplate,
                Polyline,
                esriConfig,
                SimpleLineSymbol,
                SimpleFillSymbol,
                Color,
              ]) => {
                // 山东天地图
                let tdtMapImg = null;
                let tdtMapImg2 = null;
                if (mapType === "defaultMap") {
                  tdtMapImg = new WebTileLayer(
                    //内网地址
                    // "http://10.15.112.133:6080/arcgis/rest/services/3709212022GF1DOM/MapServer",
                    "https://service.sdmap.gov.cn/tileservice/sdpubmap?tk=44c2ef89d6e7337993d863653582d3b9&layer=SDRasterPubMap&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={level}&TileCol={col}&TileRow={row}",

                    {
                      tileInfo: _this.tileInfoWeb,
                      spatialReference: _this.tileInfoWeb.spatialReference,
                    }
                  );
                  tdtMapImg2 = new WebTileLayer(
                    "https://service.sdmap.gov.cn/tileservice/sdrasterpubmap?tk=44c2ef89d6e7337993d863653582d3b9&layer=SDRasterPubMap&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={level}&TileCol={col}&TileRow={row}",
                    {
                      tileInfo: _this.tileInfoWeb,
                      spatialReference: _this.tileInfoWeb.spatialReference,
                    }
                  );
                } else {
                  tdtMapImg2 = new WebTileLayer(
                    layerUrl +
                      "?tk=44c2ef89d6e7337993d863653582d3b9&layer=SDRasterPubMap&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={level}&TileCol={col}&TileRow={row}",
                    {
                      tileInfo: _this.tileInfoWeb,
                      spatialReference: _this.tileInfoWeb.spatialReference,
                    }
                  );
                }
                // 山东天地图【影像注记】
                const tdtMapImgAno = new WebTileLayer(
                  "http://service.sdmap.gov.cn/tileservice/sdrasterpubmapdj?tk=44c2ef89d6e7337993d863653582d3b9&layer=SDRasterPubMap&style=default&tilematrixset=default028mm&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={level}&TileCol={col}&TileRow={row}",
                  {
                    tileInfo: _this.tileInfoWeb,
                    spatialReference: _this.tileInfoWeb.spatialReference,
                  }
                );
                let arcgisfontsUrl = _this.arcgisfontsUrl;

                if (arcgisfontsUrl) {
                  esriConfig.fontsUrl = arcgisfontsUrl;
                }
                let customMapCofing = {
                  // layers: [
                  //   //内网地址正式发布放开
                  //   {
                  //     type: "MapImageLayer",
                  //     serverUrl:
                  //       "http://10.15.112.133:6080/arcgis/rest/services/3709212022GF1DOM/MapServer",
                  //     title: "矢量图",
                  //   },
                  //   {
                  //     type: "MapImageLayer",
                  //     serverUrl:
                  //       "http://10.15.112.133:6080/arcgis/rest/services/3709212022GF1DOM/MapServer",
                  //     title: "影像图",
                  //   },
                  // ],
                };
                // 默认加载 谷歌，天地图
                if (
                  !customMapCofing ||
                  !customMapCofing.layers ||
                  customMapCofing.layers.length == 0
                ) {
                  // _this.imageBase = new Basemap({
                  //     baseLayers: [tdtMapImg, tdtMapImgAno],
                  //     thumbnailUrl: require("@/assets/image/影像图.png"),
                  //     title: "影像图",
                  // });
                  if (tdtMapImg2) {
                    _this.imageBase = new Basemap({
                      baseLayers: [tdtMapImg2, tdtMapImgAno],
                      thumbnailUrl: require("@/assets/image/影像图.png"),
                      title: "影像图",
                    });
                  }
                  if (tdtMapImg) {
                    _this.imageBase2 = new Basemap({
                      baseLayers: [tdtMapImg],
                      thumbnailUrl: require("@/assets/image/电子地图.png"),
                      title: "天地图",
                    });
                  }
                  // }
                  _this.map = new Map({
                    basemap: _this.imageBase, // 底图类型，详见BaseMap类
                  });
                  if (extent && extent != "") {
                    _this.mapView = new MapView({
                      container: _this.$refs.mapView, // 视图的容器
                      map: _this.map, // Map的实例放入视图中
                      center: [dtcenter.x, dtcenter.y], // 初始显示的地图中心点，经纬度
                      zoom: newzoom, // 当前地图缩放等级
                    });
                  } else {
                    _this.mapView = new MapView({
                      container: _this.$refs.mapView, // 视图的容器
                      map: _this.map, // Map的实例放入视图中
                      center: [117.014, 36.645], // 初始显示的地图中心点，经纬度
                      zoom: 6, // 当前地图缩放等级
                    });
                  }
                  _this.mapView.constraints = {
                    rotationEnabled: false,
                  };
                  let basemapGallery2 = new BasemapGallery({
                    titleVisible: true,
                    view: _this.mapView, // The view that provides access to the map's "streets" basemap
                    source: [_this.imageBase, _this.imageBase2], // Allows for toggling to the "hybrid" basemap
                  });
                  _this.mapView.ui.add(basemapGallery2, "bottom-right");
                } else {
                  // 自定义图层添加
                  let customvecList = [];
                  customMapCofing.layers.forEach((element) => {
                    let customlayer;
                    if (element.type === "MapImageLayer") {
                      customlayer = new MapImageLayer({
                        url: element.serverUrl,
                      });
                    } else if (element.type === "WebTileLayer") {
                      customlayer = new WebTileLayer(element.serverUrl, {
                        id: "customlayer",
                        spatialReference: customMapCofing.spatialReference
                          ? customMapCofing.spatialReference
                          : _this.tileInfoWeb.spatialReference,
                        tileInfo: customMapCofing.tileInfo
                          ? customMapCofing.tileInfo
                          : _this.tileInfoWeb,
                      });
                    } else if (element.type === "TileLayer") {
                      customlayer = new TileLayer({
                        url: element.serverUrl,
                      });
                    }
                    let thumbnailUrl = require("@/assets/image/电子地图.png");
                    if (element.title == "影像图") {
                      thumbnailUrl = require("@/assets/image/影像图.png");
                    }
                    let customvec = new Basemap({
                      baseLayers: [customlayer],
                      thumbnailUrl: thumbnailUrl,
                      title: element.title,
                    });
                    customvecList.push(customvec);
                  });
                  _this.map = new Map({
                    basemap: customvecList[0], // 底图类型，详见BaseMap类
                  });
                  _this.mapView = new MapView({
                    container: _this.$refs.mapView, // 视图的容器
                    map: _this.map, // Map的实例放入视图中
                    center: customMapCofing.defaultcenter
                      ? customMapCofing.defaultcenter
                      : null, // 初始显示的地图中心点，经纬度
                    zoom: 2, // 当前地图缩放等级
                  });
                  let basemapGallery = new BasemapGallery({
                    titleVisible: true,
                    view: _this.mapView, // The view that provides access to the map's "streets" basemap
                    source: customvecList, // Allows for toggling to the "hybrid" basemap
                  });
                  _this.mapView.ui.add(basemapGallery, "bottom-right");
                }
                if (customMapCofing && customMapCofing.constraints) {
                  _this.mapView.constraints = customMapCofing.constraints;
                } else {
                  _this.mapView.constraints = {
                    rotationEnabled: false,
                  };
                }
                // 图形计算服务
                // var geometryService = new GeometryService(
                //   "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/"
                // );
                var geometryService = new GeometryService(
                  "http://1.94.43.37:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/"
                );
                // 保存加载过来的Module
                _this.esriModules = {
                  MapView,
                  WebTileLayer,
                  projection,
                  SpatialReference,
                  GraphicsLayer,
                  Graphic,
                  PictureMarkerSymbol,
                  TextSymbol,
                  SimpleMarkerSymbol,
                  webMercatorUtils,
                  Point,
                  Circle,
                  Query,
                  Extent,
                  Polygon,
                  watchUtils,
                  Draw,
                  Sketch,
                  SketchViewModel,
                  geometryEngine,
                  WMSLayer,
                  geometryService,
                  BufferParameters,
                  FeatureLayer,
                  TileLayer,
                  MapImageLayer,
                  Popup,
                  Swipe,
                  PopupTemplate,
                  Polyline,
                  SceneView,
                  SimpleLineSymbol,
                  GeometryService,
                  AreasAndLengthsParameters,
                  SimpleFillSymbol,
                  Color,
                  QueryTask,
                  IdentifyTask,
                  IdentifyParameters,
                };
                _this.mapView.ui._removeComponents(["attribution"]);
                _this.mapView.ui._removeComponents(["zoom"]);
                _this.mapView.when(_this.loadMapCompleted);
                _this.mapView.when(
                  function () {
                    let that = _this;
                    if (dtscale !== "" && dtcenter !== "") {
                      let importGraphic = new that.esriModules.Graphic({
                        geometry: new that.esriModules.Polyline({
                          paths: [dtcenter.x, dtcenter.y],
                          spatialReference: that.mapView.spatialReference,
                        }),
                      });
                      that.mapView.goTo(
                        {
                          target: importGraphic,
                          scale: dtscale,
                        },
                        { duration: 1000 }
                      );
                    }
                    if (mapType === "changeMap") {
                      if (sessionStorage.getItem("ygyxisDraw") === "false") {
                        that.$emit("loadDKShapeAndZoomTo", "", false);
                      } else {
                        that.$emit("loadDKShapeAndZoomTo", "", true);
                      }
                    }
                    let view = that.mapView;
                    let level = "";
                    if (view.scale >= 4622333.678978) {
                      level = 7;
                    } else if (
                      view.scale >= 2311166.839489 &&
                      view.scale < 4622333.678978
                    ) {
                      level = 8;
                    } else if (
                      view.scale >= 1155583.419744 &&
                      view.scale < 2311166.839489
                    ) {
                      level = 9;
                    } else if (
                      view.scale >= 577791.709872 &&
                      view.scale < 1155583.419744
                    ) {
                      level = 10;
                    } else if (
                      view.scale >= 288895.854936 &&
                      view.scale < 577791.709872
                    ) {
                      level = 11;
                    } else if (
                      view.scale >= 144447.927468 &&
                      view.scale < 288895.854936
                    ) {
                      level = 12;
                    } else if (
                      view.scale >= 72223.963734 &&
                      view.scale < 144447.927468
                    ) {
                      level = 13;
                    } else if (
                      view.scale >= 36111.981867 &&
                      view.scale < 72223.963734
                    ) {
                      level = 14;
                    } else if (
                      view.scale >= 18055.990934 &&
                      view.scale < 36111.981867
                    ) {
                      level = 15;
                    } else if (
                      view.scale >= 9027.995467 &&
                      view.scale < 18055.990934
                    ) {
                      level = 16;
                    } else if (
                      view.scale >= 4513.997733 &&
                      view.scale < 9027.995467
                    ) {
                      level = 17;
                    } else {
                      level = 18;
                    }
                    let x = view.center.x;
                    let y = view.center.y;
                    _this.$emit("getYxsj", level, x, y);
                  },
                  function (error) {
                    // This function will execute if the promise is rejected due to an error
                  }
                );
                let view = _this.mapView;
                view.on("mouse-wheel", function (event) {
                  let level = "";
                  if (view.scale >= 4622333.678978) {
                    level = 7;
                  } else if (
                    view.scale >= 2311166.839489 &&
                    view.scale < 4622333.678978
                  ) {
                    level = 8;
                  } else if (
                    view.scale >= 1155583.419744 &&
                    view.scale < 2311166.839489
                  ) {
                    level = 9;
                  } else if (
                    view.scale >= 577791.709872 &&
                    view.scale < 1155583.419744
                  ) {
                    level = 10;
                  } else if (
                    view.scale >= 288895.854936 &&
                    view.scale < 577791.709872
                  ) {
                    level = 11;
                  } else if (
                    view.scale >= 144447.927468 &&
                    view.scale < 288895.854936
                  ) {
                    level = 12;
                  } else if (
                    view.scale >= 72223.963734 &&
                    view.scale < 144447.927468
                  ) {
                    level = 13;
                  } else if (
                    view.scale >= 36111.981867 &&
                    view.scale < 72223.963734
                  ) {
                    level = 14;
                  } else if (
                    view.scale >= 18055.990934 &&
                    view.scale < 36111.981867
                  ) {
                    level = 15;
                  } else if (
                    view.scale >= 9027.995467 &&
                    view.scale < 18055.990934
                  ) {
                    level = 16;
                  } else if (
                    view.scale >= 4513.997733 &&
                    view.scale < 9027.995467
                  ) {
                    level = 17;
                  } else {
                    level = 18;
                  }
                  let x = view.center.x;
                  let y = view.center.y;
                  _this.$emit("getYxsj", level, x, y);
                });
              }
            )
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    createCssLink(url) {
      const link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    },
    drowLine() {
      let _this = this;
      if (this.drawTool) {
        this.drawTool.destroy();
      } else {
        this.drawTool = null;
      }
      this.drawTool = new this.esriModules.Draw({
        view: this.mapView,
      });
      const redrawingLayer = _this.addGraphicsLayer();

      this.mapView.graphics.removeAll();
      const action = this.drawTool.create("polyline");
      this.mapView.focus();
      action.on(
        [
          "vertex-add",
          "vertex-remove",
          "cursor-update",
          "redo",
          "undo",
          "draw-complete",
        ],
        createPolyline
      );
      function createPolyline(event) {
        let view = _this.mapView;
        var vertices = event.vertices;
        var symbol = {
          type: "simple-marker",
          color: [255, 255, 255],
          size: 6,
          outline: {
            color: [255, 0, 0],
            width: 1.5, // points
          },
        };

        redrawingLayer.graphics.removeAll();
        var graphics = new _this.esriModules.Graphic({
          geometry: new _this.esriModules.Polyline({
            paths: vertices,
            spatialReference: view.spatialReference,
          }),

          symbol: {
            type: "simple-line", // autocasts as new SimpleFillSymbol
            color: [255, 116, 3],
            width: 2,
            cap: "round",
            join: "round",
          },
        });

        redrawingLayer.graphics.add(graphics);

        var firsttextSymbol = {
          type: "text",
          color: "white",
          haloColor: "black",
          haloSize: "10px",
          text: "起点",
          xoffset: "10px",
          yoffset: "10px",
          font: {
            size: 12,
            family: "sans-serif",
            weight: "bold",
          },
        };

        var firstpoint = {
          type: "point",
          x: vertices[0][0],
          y: vertices[0][1],
          spatialReference: view.spatialReference,
        };
        var firstTextGraphics = new _this.esriModules.Graphic({
          geometry: firstpoint,
          symbol: firsttextSymbol,
        });
        var firstGraphics = new _this.esriModules.Graphic({
          geometry: firstpoint,
          symbol: symbol,
        });
        redrawingLayer.graphics.add(firstTextGraphics);
        redrawingLayer.graphics.add(firstGraphics);

        //
        var path = [];
        var arr1 = [];
        arr1.push(vertices[0][0]);
        arr1.push(vertices[0][1]);
        path.push(arr1);
        for (let i = 1; i < vertices.length; i++) {
          var point = {
            type: "point",
            x: vertices[i][0],
            y: vertices[i][1],
            spatialReference: view.spatialReference,
          };
          var arr = [];
          arr.push(vertices[i][0]);
          arr.push(vertices[i][1]);

          path.push(arr);

          var line = new _this.esriModules.Polyline({
            hasZ: false,
            hasM: true,
            paths: path,
          });

          var dislen;
          var unit;
          if (view.scale > 5000) {
            dislen = _this.esriModules.geometryEngine.geodesicLength(
              line,
              "kilometers"
            );
            unit = "千米";
          } else {
            dislen = _this.esriModules.geometryEngine.geodesicLength(
              line,
              "meters"
            );
            unit = "米";
          }

          var textSymbol = {
            type: "text",
            color: "white",
            haloColor: "black",
            haloSize: "5px",
            text: Math.abs(Math.round(dislen * 100) / 100) + unit,
            xoffset: "20px",
            yoffset: "20px",
            font: {
              size: 12,
              family: "sans-serif",
              weight: "bold",
            },
          };

          var textGraphics = new _this.esriModules.Graphic({
            geometry: point,
            symbol: textSymbol,
          });

          var Graphics = new _this.esriModules.Graphic({
            geometry: point,
            symbol: symbol,
          });

          redrawingLayer.graphics.add(textGraphics);
          redrawingLayer.graphics.add(Graphics);
        }
      }
    },
    drawPolygon() {
      let _this = this;
      let view = this.mapView;
      if (this.drawTool) {
        this.drawTool.destroy();
      } else {
        this.drawTool = null;
      }
      this.drawTool = new this.esriModules.Draw({
        view: this.mapView,
      });
      const redrawingLayer = _this.addGraphicsLayer();
      var action = this.drawTool.create("polygon", { mode: "click" });
      // view.focus()
      // fires when a vertex is added
      action.on("vertex-add", function (evt) {
        drawGraphics(evt.vertices);
      });

      // fires when the pointer moves
      action.on("cursor-update", function (evt) {
        drawGraphics(evt.vertices);
      });

      // fires when the drawing is completed
      action.on("draw-complete", function (evt) {
        if (evt.vertices.length > 2) {
          evt.vertices.push(evt.vertices[0]);
          var polygon = drawGraphics(evt.vertices);
          var polygon84 = null;
          // 如果自定义地图 则不转84坐标
          if (polygon.spatialReference.latestWkid === 3857) {
            polygon84 =
              _this.esriModules.webMercatorUtils.webMercatorToGeographic(
                polygon
              );
          } else {
            polygon84 = polygon;
          }
          // if (onDrawCompleted(polygon84.toJSON())) {
          //     _this.view.graphics.removeAll()
          // }
          _this.$emit("getShapearea", getShape(polygon));
        }
      });

      // fires when a vertex is removed
      action.on("vertex-remove", function (evt) {
        drawGraphics(evt.vertices);
      });
      function drawGraphics(vertices) {
        redrawingLayer.removeAll();
        var graphic = createPolygonGraphic(vertices);
        redrawingLayer.add(graphic);
        return graphic.geometry;
      }
      function createPolygonGraphic(vertices) {
        if (vertices.length <= 2) {
          var polyline = {
            type: "polyline",
            paths: vertices,
            spatialReference: view.spatialReference,
          };

          var polylineSymbol = {
            type: "simple-line", // autocasts as SimpleLineSymbol()
            color: [255, 0, 0],
            width: 2,
          };
          return new _this.esriModules.Graphic({
            geometry: polyline,
            symbol: polylineSymbol,
          });
        }

        var polygon = {
          type: "polygon", // autocasts as Polygon
          rings: vertices,
          spatialReference: view.spatialReference,
        };

        var graphic = new _this.esriModules.Graphic({
          geometry: polygon,
          symbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [255, 0, 0, 0.2],
            style: "solid",
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [255, 0, 0, 1],
              width: 2,
              style: "solid",
            },
          },
        });
        return graphic;
      }
      function getShape(polygon) {
        return polygon;
      }
    },
    //面积测量
    areaMeasurement() {
      let _this = this;
      let view = this.mapView;
      if (this.drawTool) {
        this.drawTool.destroy();
      } else {
        this.drawTool = null;
      }
      this.drawTool = new this.esriModules.Draw({
        view: this.mapView,
      });
      const redrawingLayer = _this.addGraphicsLayer();
      var action = this.drawTool.create("polygon", { mode: "click" });
      // view.focus()
      // fires when a vertex is added
      action.on("vertex-add", function (evt) {
        drawGraphics(evt.vertices);
      });

      // fires when the pointer moves
      action.on("cursor-update", function (evt) {
        drawGraphics(evt.vertices);
      });

      // fires when the drawing is completed
      action.on("draw-complete", function (evt) {
        if (evt.vertices.length > 2) {
          evt.vertices.push(evt.vertices[0]);
          var polygon = drawGraphics(evt.vertices);
          var polygon84 = null;
          // 如果自定义地图 则不转84坐标
          if (polygon.spatialReference.latestWkid === 3857) {
            polygon84 =
              _this.esriModules.webMercatorUtils.webMercatorToGeographic(
                polygon
              );
          } else {
            polygon84 = polygon;
          }
          let graphicarea =
            Math.round(Math.abs(calcatArea(polygon.rings)) * 0.0015 * 100) /
              100 +
            "亩";

          //设置总面积的显示样式，并添加到地图上
          const areaSymbol = {
            type: "text", // autocasts as new TextSymbol()
            color: "white",
            haloColor: "#ff0000",
            haloSize: 1,
            text: graphicarea,
            // yoffset: '8px',
            font: {
              // autocasts as new Font()
              size: 12,
              weight: "bold",
            },
          };

          const { x, y } = polygon.centroid;
          var point = {
            type: "point",
            x: x,
            y: y,
            spatialReference: view.spatialReference,
          };
          const areaPoint = new _this.esriModules.Graphic({
            geometry: point,
            symbol: areaSymbol,
          });
          redrawingLayer.add(areaPoint);
          // if (onDrawCompleted(polygon84.toJSON())) {
          //     _this.view.graphics.removeAll()
          // }
          _this.$emit("getShapearea", getShape(polygon));
        }
      });

      // fires when a vertex is removed
      action.on("vertex-remove", function (evt) {
        drawGraphics(evt.vertices);
      });
      function drawGraphics(vertices) {
        redrawingLayer.removeAll();
        var graphic = createPolygonGraphic(vertices);
        redrawingLayer.add(graphic);
        return graphic.geometry;
      }
      function calcatArea(rings) {
        if (rings && _this.esriModules) {
          var polygon = {
            type: "polygon", // casts as Polygon
            rings: rings,
            spatialReference: { wkid: 4326 },
          };
          return _this.esriModules.geometryEngine.geodesicArea(
            polygon,
            "square-meters"
          );
          // return this.esriModules.geometryEngine.planarArea(polygon, 'square-meters')
        }
        return 0;
      }
      function createPolygonGraphic(vertices) {
        if (vertices.length <= 2) {
          var polyline = {
            type: "polyline",
            paths: vertices,
            spatialReference: view.spatialReference,
          };

          var polylineSymbol = {
            type: "simple-line", // autocasts as SimpleLineSymbol()
            color: [255, 116, 3],
            width: 2,
          };
          return new _this.esriModules.Graphic({
            geometry: polyline,
            symbol: polylineSymbol,
          });
        }

        var polygon = {
          type: "polygon", // autocasts as Polygon
          rings: vertices,
          spatialReference: view.spatialReference,
        };

        var graphic = new _this.esriModules.Graphic({
          geometry: polygon,
          symbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [255, 116, 3, 0.2],
            style: "solid",
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [255, 116, 3, 1],
              width: 2,
              style: "solid",
            },
          },
        });
        return graphic;
      }
      function getShape(polygon) {
        return polygon;
      }
    },
    //开始绘制多边形
    startrectangle(para, callback) {
      // 开启拉框监听
      this.destroyDraw();
      this.drawGraphicsLayermapindex.removeAll();
      this.dragHandler = this.mapView.on("drag", async (event) => {
        event.stopPropagation();
        // 1. 开始拖动
        if (event.action === "start") {
          this.startPoint = this.mapView.toMap(event);
        }
        // 2. 拖动中更新图形
        else if (event.action === "update") {
          const currentPoint = this.mapView.toMap(event);
          // 构造 Extent
          const xmin = Math.min(this.startPoint.x, currentPoint.x);
          const xmax = Math.max(this.startPoint.x, currentPoint.x);
          const ymin = Math.min(this.startPoint.y, currentPoint.y);
          const ymax = Math.max(this.startPoint.y, currentPoint.y);

          const extent = new this.esriModules.Extent({
            xmin,
            ymin,
            xmax,
            ymax,
            spatialReference: this.mapView.spatialReference,
          });
          // 画图形
          this.drawRectangle(extent);
        }
        // 3. 拖动结束
        else if (event.action === "end") {
          const endPoint = this.mapView.toMap(event);
          const xmin = Math.min(this.startPoint.x, endPoint.x);
          const xmax = Math.max(this.startPoint.x, endPoint.x);
          const ymin = Math.min(this.startPoint.y, endPoint.y);
          const ymax = Math.max(this.startPoint.y, endPoint.y);
          const extent = new this.esriModules.Extent({
            xmin,
            ymin,
            xmax,
            ymax,
            spatialReference: this.mapView.spatialReference,
          });
          console.log("拉框区域坐标：", extent);
          // 将 Extent 转为 Polygon
          const polygon = new this.esriModules.Polygon({
            rings: [
              [
                [extent.xmin, extent.ymin],
                [extent.xmin, extent.ymax],
                [extent.xmax, extent.ymax],
                [extent.xmax, extent.ymin],
                [extent.xmin, extent.ymin],
              ],
            ],
            spatialReference: extent.spatialReference,
          });
          this.destroyDraw();
          const geomertry = await this.drawBuffer(polygon, para.buffer);
          // 绘制缓冲区，单位为米
          callback(geomertry);
        }
      });
    },
    // 缓冲区绘制
    async drawBuffer(geomertry, num) {
      if (this.bufferGraphic) {
        this.drawGraphicsLayermapindex.remove(this.bufferGraphic);
      }
      if (num <= 0) {
        return geomertry;
      }
      // 生成缓冲区（单位：米）
      // 先确保 projection 模块初始化
      if (!this.esriModules.projection.isLoaded()) {
        await this.esriModules.projection.load();
      }
      // 创建目标空间参考（Web Mercator）
      const webMercatorSR = new this.esriModules.SpatialReference({
        wkid: 3857,
      });

      const webMercatorwgs = new this.esriModules.SpatialReference({
        wkid: 4326,
      });

      // 将 polygon 投影为线性坐标系
      const projectedPolygon = this.esriModules.projection.project(
        geomertry,
        webMercatorSR
      );
      const outer = this.esriModules.geometryEngine.buffer(
        projectedPolygon,
        num,
        "meters"
      ); // 外圈缓冲区
      const hole = projectedPolygon; // 原始图形作为内洞
      // 使用 geometryEngine.difference 计算环形区域（外圈 - 内圈）
      const donutGeometry = this.esriModules.geometryEngine.difference(
        outer,
        hole
      );
      this.bufferGraphic = new this.esriModules.Graphic({
        geometry: donutGeometry,
        symbol: {
          type: "simple-fill",
          color: [255, 116, 3, 1],
          style: "forward-diagonal",
          outline: {
            color: [255, 116, 3, 1],
            width: 2,
          },
        },
      });
      // 你的矩形区域和缓冲区几何（Polygon）
      const bufferPolygon = donutGeometry; // 缓冲后的 Polygon（或 donut）
      const bufferArea = this.esriModules.geometryEngine.geodesicArea(
        bufferPolygon,
        "square-meters"
      );
      // 保留两位小数，转为平方公里（可选）
      const bufferAreaKm2 = (bufferArea / 1e6).toFixed(2);
      // 你的矩形区域和缓冲区几何（Polygon）
      const Polygon = projectedPolygon; // 缓冲后的 Polygon（或 donut）
      const PolygonArea = this.esriModules.geometryEngine.geodesicArea(
        Polygon,
        "square-meters"
      );
      // 保留两位小数，转为平方公里（可选）
      const PolygonAreaKm2 = (PolygonArea / 1e6).toFixed(2);
      this.drawGraphicsLayermapindex.add(this.bufferGraphic);
      return this.esriModules.projection.project(outer, webMercatorwgs);
      console.log(
        "绘制面积:",
        PolygonArea.toFixed(2),
        "m² /",
        PolygonAreaKm2,
        "km²"
      );
      console.log(
        "缓冲区面积:",
        bufferArea.toFixed(2),
        "m² /",
        bufferAreaKm2,
        "km²"
      );
    },

    // 绘制矩形
    drawRectangle(extent, Graphic) {
      if (this.rectangleGraphic) {
        this.drawGraphicsLayermapindex.remove(this.rectangleGraphic);
      }

      this.rectangleGraphic = new this.esriModules.Graphic({
        geometry: extent,
        symbol: {
          type: "simple-fill",
          color: [255, 116, 3, 0.2],
          outline: {
            color: [255, 116, 3, 1],
            width: 2,
          },
        },
      });

      this.drawGraphicsLayermapindex.add(this.rectangleGraphic);
    },
    addLayer: function (layer, index) {
      // 默认设置图层级别是-1最底层
      if (!index) {
        index = -1;
      }
      if (this.map != null) {
        this.map.layers.add(layer);
        // this.$message.error(layer)
      }
    },
    loadMapCompleted: function () {
      this.$emit("initCompleted", this);
      this.drawGraphicsLayermapindex = this.addGraphicsLayer();
      // this.$nextTick(() => {

      // });
    },
    addGraphicsLayer() {
      var _this = this;
      const GraphicsLayer = this.esriModules.GraphicsLayer();
      _this.drawlayers.push(GraphicsLayer);
      _this.addLayer(GraphicsLayer);
      return GraphicsLayer;
    },
    removeLayer(arr) {
      if (arr.length > 0) {
        arr.forEach((element) => {
          this.map.remove(element);
        });
      }
    },
    removedraw() {
      this.removeLayer(this.drawlayers);
    },
    //销毁绘制
    destroyDraw() {
      if (this.drawTool) {
        this.drawTool.destroy();
        this.drawTool = null;
      }
      if (this.dragHandler) {
        this.dragHandler.remove();
        this.dragHandler = null;
      }
      if (this.sketch) {
        this.sketch.destroy();
        this.sketch = null;
      }
    },
    startDrawpoint(para, callback) {
      this.destroyDraw();
      this.drawGraphicsLayermapindex.removeAll();
      this.dragHandler = this.mapView.on("click", async (event) => {
        const point = event.mapPoint;
        const pointGraphic = new this.esriModules.Graphic({
          geometry: point,
          symbol: {
            type: "simple-marker",
            color: [255, 255, 255],
            size: 8,
            outline: {
              color: [255, 255, 255],
              width: 1,
            },
          },
        });
        this.drawGraphicsLayermapindex.add(pointGraphic);
        const geomertry = await this.drawBuffer(point, para.buffer); // 绘制缓冲区，单位为米
        this.destroyDraw();
        callback(geomertry, point);
      });
    },
    startDrawpolygon(para, callback) {
      this.destroyDraw();
      this.drawGraphicsLayermapindex.removeAll();
      this.sketch = new this.esriModules.SketchViewModel({
        view: this.mapView,
        layer: this.drawGraphicsLayermapindex,
        polygonSymbol: {
          type: "simple-fill",
          color: [255, 116, 3, 0.2],
          style: "solid",
          outline: {
            color: [255, 116, 3, 1],
            width: 2,
          },
        },
      });
      this.sketch.create("polygon");

      this.sketch.on("create", async (event) => {
        if (event.state === "complete") {
          const graphic = event.graphic;
          const polygon = event.graphic.geometry;
          const geomertry = await this.drawBuffer(polygon, para.buffer); // 绘制缓冲区，单位为米
          this.sketch.layer.remove(graphic);
          this.drawGraphicsLayermapindex.add(graphic);
          this.destroyDraw();
          callback(geomertry);
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.box {
  width: 400px;
  height: 300px;
  border: 20px solid;
}

.el-dialog__body {
  padding: 0px 20px 30px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}

.esri-popup__main-container.esri-widget {
  width: 310px !important;
  max-height: 360px !important;
}

::v-deep .esri-component .esri-basemap-gallery__item-container {
  flex-flow: row nowrap;
}

::v-deep .esri-component .esri-basemap-gallery__item:first-child {
  margin-top: 0;
}

::v-deep .esri-component .esri-basemap-gallery__item {
  padding: 0;
  border: none;
  position: relative;
}

::v-deep .esri-component .esri-basemap-gallery__item:first-child {
  margin-right: 10px;
}

::v-deep .esri-component .esri-basemap-gallery__item-title {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  background-color: #fff;
  color: #6e6e6e;
  z-index: 99;
}

::v-deep .esri-component.esri-basemap-gallery {
  min-width: 0;
  background-color: transparent;
  display: block;
}

::v-deep .esri-component .esri-basemap-gallery__item-thumbnail {
  width: 65px;
}

::v-deep
  .esri-component
  .esri-basemap-gallery__item:hover
  .esri-basemap-gallery__item-title,
::v-deep
  .esri-component
  .esri-basemap-gallery__item:focus
  .esri-basemap-gallery__item-title {
  color: #f56c6c;
}

::v-deep
  .esri-component
  .esri-basemap-gallery__item--selected
  .esri-basemap-gallery__item-title,
::v-deep
  .esri-component
  .esri-basemap-gallery__item.esri-basemap-gallery__item--selected:hover
  .esri-basemap-gallery__item-title,
::v-deep
  .esri-component
  .esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus
  .esri-basemap-gallery__item-title {
  color: #f56c6c;
}

::v-deep
  .esri-view-width-greater-than-large
  .esri-ui-corner
  .esri-basemap-gallery.esri-component
  .esri-basemap-gallery__item-container
  .esri-basemap-gallery__item {
  border: none;
  padding: 0;
  width: auto;
  margin: 0;
}

::v-deep
  .esri-view-width-greater-than-large
  .esri-ui-corner
  .esri-basemap-gallery.esri-component
  .esri-basemap-gallery__item-container
  .esri-basemap-gallery__item:first-child {
  /* margin-right: 10px; */
}

::v-deep
  .esri-view-width-greater-than-large
  .esri-ui-corner
  .esri-basemap-gallery.esri-component
  .esri-basemap-gallery__item-container
  .esri-basemap-gallery__item-title {
  margin-top: 0;
}

::v-deep
  .esri-view-width-greater-than-large
  .esri-ui-corner
  .esri-basemap-gallery.esri-component
  .esri-basemap-gallery__item-container
  .esri-basemap-gallery__item-thumbnail {
  margin-bottom: 0;
}

::v-deep
  .esri-ui-bottom-right
  .esri-view-width-greater-than-large
  .esri-ui-corner
  .esri-basemap-gallery.esri-component {
  width: 200px;
}

::v-deep .esri-ui-inner-container {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  inset: 15px 15px 10px !important;
}

::v-deep .esri-popup__main-container.esri-widget {
  width: 310px !important;
  max-height: 360px !important;
}

::v-deep
  .esri-view-width-greater-than-large
  .esri-ui-corner
  .esri-basemap-gallery.esri-component {
  width: 130px;
  max-width: initial;
}

/* .esri-view-height-xsmall .esri-expand .esri-widget--panel, .esri-view-height-xsmall .esri-expand .esri-widget--panel-height-only, .esri-view-height-xsmall .esri-ui-corner .esri-component.esri-widget--panel, .esri-view-height-xsmall .esri-ui-corner .esri-component.esri-widget--panel-height-only {
    max-height: 240px;
    bottom: -18px!important;
} */
</style>
