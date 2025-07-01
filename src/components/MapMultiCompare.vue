<template>
  <div class="map-multi-compare-container">
    <!-- 地图容器网格 -->
    <div class="map-grid" :class="gridClass">
      <div v-for="(map, index) in maps" :key="index" class="map-container">
        <div :id="'mapView' + index" class="map-view"></div>
        <!-- 地图标题 -->
        <div class="map-title">{{ map.title }}</div>
      </div>
    </div>

    <!-- 布局切换按钮 -->
    <div class="layout-switcher">
      <el-button @click="switchLayout(4)">四屏</el-button>
      <el-button @click="switchLayout(6)">六屏</el-button>
      <el-button @click="switchLayout(8)">八屏</el-button>
    </div>
  </div>
</template>

<script>
import esriLoader from "esri-loader";

export default {
  name: "MapMultiCompare",
  data() {
    return {
      mapViews: [],
      screenCount: 4, // 默认四屏
      maps: [],
      options: {
        url: "https://js.arcgis.com/4.24/",
        css: "https://js.arcgis.com/4.24/esri/themes/light/main.css",
      },
    };
  },
  computed: {
    gridClass() {
      return {
        "grid-4": this.screenCount === 4,
        "grid-6": this.screenCount === 6,
        "grid-8": this.screenCount === 8,
      };
    },
  },
  mounted() {
    this.createCssLink(this.options.css);
    esriLoader
      .loadScript(this.options)
      .then(() => {
        this.initMaps();
      })
      .catch((err) => {
        console.error("ArcGIS API 加载失败:", err);
      });
  },
  methods: {
    createCssLink(url) {
      const link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    },

    async initMaps() {
      try {
        const [Map, MapView, WebTileLayer, MapImageLayer, SpatialReference] =
          await esriLoader.loadModules(
            [
              "esri/Map",
              "esri/views/MapView",
              "esri/layers/WebTileLayer",
              "esri/layers/MapImageLayer",
              "esri/geometry/SpatialReference",
            ],
            this.options
          );

        // 清除现有地图视图
        if (this.mapViews.length > 0) {
          this.mapViews.forEach((view) => view.destroy());
        }
        this.mapViews = [];

        // 创建新的地图视图
        for (let i = 0; i < this.screenCount; i++) {
          const map = new Map();
          // 添加天地图底图
          const tdtVectorLayer = new WebTileLayer({
            urlTemplate:
              "http://t{subDomain}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=5d136cb631a37077b88a7f2eb2d0a844",
            subDomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            spatialReference: new SpatialReference({ wkid: 102100 }),
          });

          // 添加天地图注记
          const tdtVectorAnnotationLayer = new WebTileLayer({
            urlTemplate:
              "http://t{subDomain}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=5d136cb631a37077b88a7f2eb2d0a844",
            subDomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            spatialReference: new SpatialReference({ wkid: 102100 }),
          });

          map.add(tdtVectorLayer, 0);
          map.add(tdtVectorAnnotationLayer, 1);

          // 创建地图视图
          const view = new MapView({
            container: "mapView" + i,
            map: map,
            center: [117.014, 36.645],
            zoom: 10,
            spatialReference: new SpatialReference({ wkid: 102100 }),
            constraints: {
              rotationEnabled: false,
              minZoom: 3,
              maxZoom: 18,
            },
            ui: {
              components: ["zoom"],
            },
          });

          this.mapViews.push(view);

          // 只和主视图同步
          if (i > 0) {
            view.when(() => {
              this.syncViews(this.mapViews[0], this.mapViews.slice(1)); // 传入所有其他视图
            });
          }
        }
      } catch (error) {
        console.error("地图初始化失败:", error);
      }
    },

    syncViews(mainView, otherViews) {
      let synchronizing = false;

      const sync = (sourceView, targetViews) => {
        if (!synchronizing) {
          synchronizing = true;
          Promise.all(
            targetViews.map((targetView) =>
              targetView.when(() => {
                targetView.set({
                  center: sourceView.center,
                  scale: sourceView.scale,
                });
              })
            )
          ).then(() => {
            synchronizing = false;
          });
        }
      };

      // 监听主视图的事件
      mainView.on("drag", () => {
        sync(mainView, otherViews);
      });

      mainView.on("mouse-wheel", () => {
        sync(mainView, otherViews);
      });

      mainView.on("double-click", () => {
        sync(mainView, otherViews);
      });

      mainView.on("key-down", (event) => {
        const keys = [
          "+",
          "-",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ];
        if (keys.includes(event.key)) {
          sync(mainView, otherViews);
        }
      });

      // 监听其他视图的事件
      otherViews.forEach((view) => {
        view.on("drag", () => {
          const remainingViews = [
            mainView,
            ...otherViews.filter((v) => v !== view),
          ];
          sync(view, remainingViews);
        });

        view.on("mouse-wheel", () => {
          const remainingViews = [
            mainView,
            ...otherViews.filter((v) => v !== view),
          ];
          sync(view, remainingViews);
        });

        view.on("double-click", () => {
          const remainingViews = [
            mainView,
            ...otherViews.filter((v) => v !== view),
          ];
          sync(view, remainingViews);
        });

        view.on("key-down", (event) => {
          const keys = [
            "+",
            "-",
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
          ];
          if (keys.includes(event.key)) {
            const remainingViews = [
              mainView,
              ...otherViews.filter((v) => v !== view),
            ];
            sync(view, remainingViews);
          }
        });
      });
    },

    switchLayout(count) {
      this.screenCount = count;
      this.maps = [];
      let obj = {
        title: "天地图",
        url: "", // 不需要服务URL
        effect: "",
      };
      for (let index = 0; index < this.screenCount; index++) {
        this.maps.push(obj);
      }
      this.$nextTick(() => {
        this.initMaps();
      });
    },

    // 添加加载服务的方法
    async loadService(index, serviceUrl, effect = "") {
      if (index >= 0 && index < this.mapViews.length) {
        try {
          const [MapImageLayer] = await esriLoader.loadModules(
            ["esri/layers/MapImageLayer"],
            this.options
          );

          const view = this.mapViews[index];
          const map = view.map;

          // 移除旧的服务图层（如果存在）
          map.layers.forEach((layer) => {
            if (layer instanceof MapImageLayer) {
              map.remove(layer);
            }
          });

          // 添加新的服务图层
          if (serviceUrl) {
            const serviceLayer = new MapImageLayer({
              url: serviceUrl,
              effect: effect,
            });
            map.add(serviceLayer);

            // 更新标题
            this.maps[index].title = `影像 ${index + 1}`;
            this.maps[index].url = serviceUrl;
            this.maps[index].effect = effect;
          }
        } catch (error) {
          console.error(`加载服务失败 (index: ${index}):`, error);
        }
      }
    },
  },
};
</script>

<style scoped>
.map-multi-compare-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 2px;
  padding: 2px;
  background: #333;
}

.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.grid-6 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.grid-8 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
}

.map-view {
  width: 100%;
  height: 100%;
}

.map-title {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1;
}

.layout-switcher {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.layout-switcher button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.layout-switcher button:hover {
  background: #f0f0f0;
}
</style> 