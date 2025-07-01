<template>
  <div class="layer-list-container">
    <el-card class="layer-card">
      <div slot="header" class="header">
        <i class="el-icon-map-location"></i>
        <span>现状图层</span>
      </div>
      <el-radio-group v-model="selectedLayer" @change="handleLayerChange">
        <div class="layer-item" v-for="layer in layerList" :key="layer.id">
          <el-radio :label="layer.id">
            <div class="layer-content">
              <i :class="layer.icon"></i>
              <span>{{ layer.name }}</span>
            </div>
          </el-radio>
        </div>
      </el-radio-group>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "CurrentStateLayer",
  watch: {
    selectedLayer(newVal, oldVal) {
      if (newVal !== oldVal) {
        var layer = this.layerList.find((item) => item.id === oldVal);
        this.$emit("remove-layer", layer);
      }
    },
  },
  data() {
    return {
      selectedLayer: "",
      layerList: [
        {
          id: "1",
          name: "林业-新泰自然保护地",
          icon: "el-icon-tree",
          url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSZRBHD/MapServer",
          layerid: "0",
        },
        {
          id: "2",
          name: "林业-新泰公益林",
          icon: "el-icon-leaf",
          url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSGYL/MapServer",
          layerid: "0",
        },
        {
          id: "3",
          name: "林业-新泰林地一张图",
          icon: "el-icon-mountain",
          url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_XTSYZT/MapServer",
          layerid: "0",
        },
        {
          id: "4",
          name: "林业-新泰2024现状",
          icon: "el-icon-water-cup",
          url: "https://sdzrzy.cn:9912/arcgisproxy/rest/services/LY_2024XTSXZ/MapServer",
          layerid: "0",
        },
      ],
    };
  },
  methods: {
    handleLayerChange(value) {
      var layer = this.layerList.find((item) => item.id === value);
      this.$emit("layer-change", layer);
    },
  },
};
</script>

<style lang="scss" scoped>
.layer-list-container {
  width: 300px;
  height: 200px;

  .layer-card {
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95),
      rgba(255, 255, 255, 0.85)
    );
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    ::v-deep .el-card__header {
      padding: 0;
    }
    ::v-deep .el-card__body {
      padding: 0;
    }
    .header {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid rgba(44, 62, 80, 0.1);
      padding: 8px 16px;
      margin-bottom: 0;
      flex-shrink: 0;

      i {
        margin-right: 8px;
        font-size: 20px;
        color: #409eff;
      }
    }

    .layer-item {
      padding: 6px 16px;
      border-bottom: 1px solid rgba(44, 62, 80, 0.05);
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: rgba(64, 158, 255, 0.05);
        transform: translateX(5px);
      }
    }
  }

  ::v-deep .el-radio-group {
    display: flex;
    flex-direction: column;
    height: calc(100% - 20px);
    overflow-y: auto;
    padding: 0;
    margin-right: 4px;
    overflow-x: hidden;

    .el-radio {
      width: 100%;
      margin-right: 0;
      height: 32px;
      display: flex;
      align-items: center;

      .el-radio__input {
        margin-right: 8px;
      }

      .el-radio__label {
        padding-left: 0;
      }

      .layer-content {
        display: flex;
        align-items: center;
        height: 100%;

        i {
          margin-right: 8px;
          font-size: 16px;
          color: #409eff;
        }

        span {
          color: #2c3e50;
          font-size: 14px;
          line-height: 1;
        }
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(64, 158, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(64, 158, 255, 0.5);
      }
    }

    &::-webkit-scrollbar-track {
      background: rgba(44, 62, 80, 0.05);
      border-radius: 3px;
      margin: 4px 0;
    }
  }

  ::v-deep .el-radio__input.is-checked + .el-radio__label {
    color: #409eff;
  }

  ::v-deep .el-radio__input.is-checked .el-radio__inner {
    background: #409eff;
    border-color: #409eff;
  }
}
</style>
