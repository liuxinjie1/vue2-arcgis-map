<template>
  <div class="map-compare-container">
    <div id="mapViewContainer" class="map-view"></div>

    <!-- 滑动条 -->
    <div class="slider-container">
      <div
        class="slider-bar"
        :style="{ left: sliderPosition + '%' }"
        @mousedown="startDragging"
        @touchstart.prevent="startDragging"
      >
        <div class="slider-handle"></div>
      </div>
    </div>
  </div>
</template>

<script>
import esriLoader from "esri-loader";

export default {
  name: "MapCompare",
  data() {
    return {
      mapView: null,
      map: null,
      serviceLayer1: null,
      serviceLayer2: null,
      sliderPosition: 50,
      isDragging: false,
      options: {
        url: "https://js.arcgis.com/4.24/",
        css: "https://js.arcgis.com/4.24/esri/themes/light/main.css"
      }
    };
  },
  mounted() {
    this.createCssLink(this.options.css);
    esriLoader
      .loadScript(this.options)
      .then(() => {
        this.initMap();
        this.addDragEvents();
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

    async initMap() {
      try {
        const [Map, MapView, WebTileLayer, MapImageLayer, SpatialReference, Swipe] = await esriLoader.loadModules([
          'esri/Map',
          'esri/views/MapView',
          'esri/layers/WebTileLayer',
          'esri/layers/MapImageLayer',
          'esri/geometry/SpatialReference',
          'esri/widgets/Swipe'
        ], this.options);

        // 创建地图
        this.map = new Map();

        // 添加天地图底图
        const tdtVectorLayer = new WebTileLayer({
          urlTemplate:
            "http://t{subDomain}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=5d136cb631a37077b88a7f2eb2d0a844",
          subDomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          spatialReference: new SpatialReference({ wkid: 102100 }),
        });

        // 添加天地图注记图层
        const tdtVectorAnnotationLayer = new WebTileLayer({
          urlTemplate:
            "http://t{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=5d136cb631a37077b88a7f2eb2d0a844",
          subDomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
          spatialReference: new SpatialReference({ wkid: 102100 }),
        });

        this.map.add(tdtVectorLayer, 0);
        this.map.add(tdtVectorAnnotationLayer, 1);

        // 添加第一个服务图层（左侧蓝色）
        this.serviceLayer1 = new MapImageLayer({
          url: "http://1.94.43.37:6080/arcgis/rest/services/jkm_xzgd2000/MapServer",
          opacity: 1,
          effect: "bloom(1, 0px, 0) sepia(0) hue-rotate(240deg)"
        });
        this.map.add(this.serviceLayer1);

        // 添加第二个服务图层（右侧）
        this.serviceLayer2 = new MapImageLayer({
          url: "http://1.94.43.37:6080/arcgis/rest/services/jkm_xzgd2000/MapServer",
          opacity: 1
        });
        this.map.add(this.serviceLayer2);

        // 创建地图视图
        this.mapView = new MapView({
          container: "mapViewContainer",
          map: this.map,
          center: [117.014, 36.645],
          zoom: 10,
          spatialReference: new SpatialReference({ wkid: 102100 }),
          constraints: {
            rotationEnabled: false,
            minZoom: 3,
            maxZoom: 18
          }
        });

        // 监听视图加载完成
        this.mapView.when(() => {
          // 创建并添加 Swipe widget
          const swipe = new Swipe({
            view: this.mapView,
            leadingLayers: [this.serviceLayer1],
            trailingLayers: [this.serviceLayer2],
            position: 50,
            direction: "horizontal"
          });

          // 添加 Swipe widget 到视图
          this.mapView.ui.add(swipe);

          // 监听 swipe 位置变化
          swipe.watch("position", (position) => {
            this.sliderPosition = position;
          });

          // 监听滑块位置变化
          this.$watch('sliderPosition', (newPosition) => {
            swipe.position = newPosition;
          });
        });
      } catch (error) {
        console.error("地图初始化失败:", error);
      }
    },

    startDragging(event) {
      event.preventDefault();  // 防止默认行为
      this.isDragging = true;
      
      // 立即更新位置
      this.updatePosition(event);

      // 添加触摸事件监听
      if (event.type === 'touchstart') {
        document.addEventListener('touchmove', this.onDragging, { passive: false });
        document.addEventListener('touchend', this.stopDragging);
        document.addEventListener('touchcancel', this.stopDragging);
      } else {
        document.addEventListener('mousemove', this.onDragging);
        document.addEventListener('mouseup', this.stopDragging);
      }
    },

    onDragging(event) {
      if (!this.isDragging) return;
      event.preventDefault();  // 防止默认行为
      this.updatePosition(event);
    },

    updatePosition(event) {
      const container = document.getElementById('mapViewContainer');
      const rect = container.getBoundingClientRect();
      
      // 获取触摸点或鼠标位置
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      let position = ((clientX - rect.left) / rect.width) * 100;

      // 限制在 0-100 范围内
      position = Math.max(0, Math.min(100, position));
      this.sliderPosition = position;
    },

    stopDragging() {
      this.isDragging = false;
      
      // 移除所有事件监听
      document.removeEventListener('mousemove', this.onDragging);
      document.removeEventListener('mouseup', this.stopDragging);
      document.removeEventListener('touchmove', this.onDragging);
      document.removeEventListener('touchend', this.stopDragging);
      document.removeEventListener('touchcancel', this.stopDragging);
    },

    addDragEvents() {
      const sliderBar = document.querySelector('.slider-bar');
      if (sliderBar) {
        sliderBar.addEventListener('touchstart', this.startDragging, { passive: false });
      }
    },
  },
  beforeDestroy() {
    if (this.mapView) {
      this.mapView.destroy();
    }
  },
};
</script>

<style scoped>
.map-compare-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.map-view {
  width: 100%;
  height: 100%;
  overflow: hidden; 
}

.slider-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.slider-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(255, 255, 255, 0.8);
  cursor: col-resize;
  pointer-events: auto;
  touch-action: none;  /* 防止触摸设备的默认行为 */
}

.slider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;  /* 防止触摸设备的默认行为 */
}

.slider-handle::before,
.slider-handle::after {
  content: "";
  position: absolute;
  width: 2px;
  height: 16px;
  background: #666;
}

.slider-handle::before {
  left: 13px;
}

.slider-handle::after {
  right: 13px;
}
::v-deep .esri-swipe__container{
  display: none !important;

}
</style> 