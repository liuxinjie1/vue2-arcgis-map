<template>
  <div class="imgbody">
    <div class="imglist" v-show="imglistshow">
      <el-collapse
        v-for="(items, index) in groups"
        :key="index"
        v-model="activeName"
      >
        <el-collapse-item :name="items.name">
          <template slot="title">
            <span class="type"> {{ items.name }}</span>
            <span class="nums"> 共 {{ items.images.length }} 张</span>
          </template>
          <div
            class="item"
            v-for="(item, indexs) in items.images"
            :key="indexs"
            @mouseenter="handleMouseEnter(item)"
            @mouseleave="handleMouseleave(item)"
          >
            <img
              :src="item.filename"
              @dragstart.prevent
              @click="selectGroup(index, indexs)"
            />
            <span v-show="!item.isshow">2024-08-15 16:36</span>
            <span v-show="item.isshow">删 除</span>
          </div>
          <!-- <div class="items">
            <img src="@/assets/image/moreImg.png" alt="" />
            <span>+{{ 5 }}张</span>
          </div> -->
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- 图片预览区 -->
    <div class="preview-container" v-show="!imglistshow">
      <div class="image-wrapper" @wheel="handleWheelZoom">
        <img
          :src="currentImage.filename"
          alt="Preview Image"
          :style="{ transform: imageTransform }"
          @dragstart.prevent
        />
      </div>
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-tooltip class="item" effect="dark" content="放大" placement="top">
          <i class="el-icon-zoom-in" @click="zoomIn"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="缩小" placement="top">
          <i class="el-icon-zoom-out" @click="zoomOut"></i>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="向左旋转"
          placement="top"
        >
          <i class="el-icon-refresh-left" @click="rotateLeft"></i>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="向右旋转"
          placement="top"
        >
          <i class="el-icon-refresh-right" @click="rotateRight"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="删除" placement="top">
          <i class="el-icon-delete"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="全屏" placement="top">
          <i @click="fullScreen" class="el-icon-full-screen"></i>
        </el-tooltip>
      </div>
      <!-- 序号切换 -->
      <div class="image-info">
        <input
          class="imageindex"
          v-model.number="inputIndex"
          min="1"
          :max="currentGroupImages.length"
          @keyup.enter="jumpToImage"
          @input="handleInput"
          @blur="handleBlur"
          type="number"
        />
        <span> / {{ currentGroupImages.length }}</span>
      </div>
      <!-- 返回按钮 -->
      <div class="image-back">
        <el-button size="mini" type="primary" icon="el-icon-back" @click="hide"
          >返回</el-button
        >
      </div>
      <!-- 分组栏 -->
      <div class="image-group">
        <span>照片类型：</span>
        <el-select
          v-model="value"
          placeholder="请选择"
          size="mini"
          @change="imgType"
        >
          <el-option
            v-for="item in groups"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          >
          </el-option>
        </el-select>
      </div>
      <!-- 切换按钮 -->

      <el-button
        size="mini"
        type="primary"
        icon="el-icon-caret-left"
        class="image-leftbt"
        @click="prev"
      ></el-button>
      <el-button
        size="mini"
        type="primary"
        icon="el-icon-caret-right"
        class="image-rightbt"
        @click="next"
      ></el-button>
    </div>
    <!-- 全屏预览 -->
    <div
      class="overlay"
      id="overlay"
      v-show="imgFullscreen"
      @wheel="handleWheelZoomFull"
    >
      <div class="close" id="closeButton" @click="closePreview">×</div>
      <img
        :src="currentImage.filename"
        alt="大图"
        @dragstart.prevent
        :style="{ transform: imageTransformFull }"
      />

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-tooltip class="item" effect="dark" content="放大" placement="top">
          <i class="el-icon-zoom-in" @click="zoomInFull"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="缩小" placement="top">
          <i class="el-icon-zoom-out" @click="zoomOutFull"></i>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="向左旋转"
          placement="top"
        >
          <i class="el-icon-refresh-left" @click="rotateLeftFull"></i>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="dark"
          content="向右旋转"
          placement="top"
        >
          <i class="el-icon-refresh-right" @click="rotateRightFull"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="bottomfy" v-show="imglistshow">
      <transition name="el-fade-in">
        <el-radio-group v-show="isshowfz" v-model="radio" @change="groupImages">
          <el-radio label="无分组">无分组</el-radio>
          <el-radio label="按照片类型分组">按照片类型分组</el-radio>
          <el-radio label="按拍摄人员分组">按拍摄人员分组</el-radio>
          <el-radio label="按拍摄月份分组">按拍摄月份分组</el-radio>
          <el-radio label="按拍摄年份分组">按拍摄年份分组</el-radio>
        </el-radio-group>
      </transition>
      <transition name="el-fade-in">
        <el-form
          v-show="isshowsx"
          ref="form"
          :model="form"
          label-width="80px"
          size="mini"
          class="imgae-form-inline"
        >
          <el-form-item label="拍摄人员">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="拍摄时间">
            <el-date-picker
              v-model="form.value1"
              type="date"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="form.value1"
              type="date"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" size="small"
              >重置</el-button
            >
            <el-button size="small">查询</el-button>
          </el-form-item>
        </el-form>
      </transition>

      <el-button
        @click="
          isshowfz = !isshowfz;
          isshowsx = false;
        "
        type="primary"
        size="mini"
        >{{ radio }}<i class="el-icon-arrow-up el-icon--right"></i
      ></el-button>
      <el-button
        @click="
          isshowfz = false;
          isshowsx = !isshowsx;
        "
        type="primary"
        size="mini"
        >条件筛选<i class="el-icon-search el-icon--right"></i
      ></el-button>
      <span class="sxjgcla">筛选结果：3/3</span>
    </div>
  </div>
</template>

<script>
import { handleTree } from "@/utils/utils";
export default {
  name: "FieldChiefSystemWebImgaes",
  props: {
    imagedata: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      activeName: [],
      isshow: false,
      radio: "",
      isshowfz: false,
      isshowsx: false,
      imgFullscreen: false,
      form: {},
      currentGroupIndex: 0,
      currentIndex: 0,
      scale: 1,
      rotation: 0,
      scaleFull: 1,
      rotationFull: 0,
      imglistshow: true,
      value: null,
      inputIndex: null,
      fullsrcList: [],
      radio: "无分组",
      groups: [],
    };
  },
  watch: {
    imagedata: {
      handler: function (val) {
        // this.groupImages("图斑编号");
      },
      deep: true,
    },
  },
  mounted() {},
  computed: {
    currentGroupImages() {
      if (this.groups.length === 0) {
        return [];
      }
      return this.groups[this.currentGroupIndex].images;
    },
    currentImage() {
      if (this.currentGroupImages.length === 0) {
        return {};
      }
      return this.currentGroupImages[this.currentIndex];
    },
    imageTransform() {
      return `scale(${this.scale}) rotate(${this.rotation}deg)`;
    },
    imageTransformFull() {
      return `scale(${this.scaleFull}) rotate(${this.rotationFull}deg)`;
    },
  },

  methods: {
    handleMouseleave(eve) {
      eve.isshow = false;
    },
    handleMouseEnter(eve) {
      eve.isshow = true;
    },
    onSubmit() {},
    selectGroup(GroupIndex, imgindex) {
      this.imglistshow = false;
      this.currentGroupIndex = GroupIndex;
      this.currentIndex = imgindex;
      this.inputIndex = imgindex + 1;
      this.value = this.groups[GroupIndex].name;
      this.$emit("selectimg", this.currentImage);
      this.resetTransform();
    },
    mapselectimg(guid) {
      let index = this.imagedata.findIndex((item) => item.guid === guid);
      this.imglistshow = false;
      this.currentGroupIndex = 0;
      this.currentIndex = index;
      this.inputIndex = index + 1;
      this.resetTransform();
    },
    zoomIn() {
      this.scale += 0.1;
    },
    zoomOut() {
      if (this.scale > 0.2) this.scale -= 0.1;
    },
    rotateLeft() {
      this.rotation = (this.rotation - 90) % 360; // 向左旋转（逆时针）
    },
    rotateRight() {
      this.rotation = (this.rotation + 90) % 360; // 向右旋转（顺时针）
    },
    zoomInFull() {
      this.scaleFull += 0.1;
    },
    zoomOutFull() {
      if (this.scaleFull > 0.2) this.scaleFull -= 0.1;
    },
    rotateLeftFull() {
      this.rotationFull = (this.rotationFull - 90) % 360; // 向左旋转（逆时针）
    },
    rotateRightFull() {
      this.rotationFull = (this.rotationFull + 90) % 360; // 向右旋转（顺时针）
    },
    jumpToImage() {
      if (
        this.inputIndex >= 1 &&
        this.inputIndex <= this.currentGroupImages.length
      ) {
      } else {
        this.inputIndex = this.currentGroupImages.length;
      }
      this.resetTransform();
      this.currentIndex = this.inputIndex - 1;
      this.$emit("selectimg", this.currentImage);
    },
    prev() {
      if (this.inputIndex === 1) {
        this.$message.info("已经是第一张了");
        return;
      }
      this.inputIndex--;
      this.currentIndex = this.inputIndex - 1;
      this.$emit("selectimg", this.currentImage);
      this.resetTransform();
    },
    next() {
      if (this.inputIndex >= this.currentGroupImages.length) {
        this.$message.info("已经是最后一张了");
        return;
      }
      this.inputIndex++;
      this.currentIndex = this.inputIndex - 1;
      this.$emit("selectimg", this.currentImage);
      this.resetTransform();
    },
    resetTransform() {
      this.scale = 1;
      this.rotation = 0;
      this.scaleFull = 1;
      this.rotationFull = 0;
    },
    handleWheelZoom(event) {
      // 滚轮向上放大，向下缩小
      event.preventDefault(); // 阻止页面滚动
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    },
    handleWheelZoomFull(event) {
      // 滚轮向上放大，向下缩小
      event.preventDefault(); // 阻止页面滚动
      if (event.deltaY < 0) {
        this.zoomInFull();
      } else {
        this.zoomOutFull();
      }
    },
    handleInput(event) {
      const rawValue = event.target.value;
      // 使用正则表达式去除非数字字符
      const numericValue = rawValue.replace(/[^0-9]/g, "");
      this.inputIndex = numericValue;
    },
    handleBlur() {
      if (!this.inputIndex) {
        this.inputIndex = 1; // 失去焦点时，如果值为空，赋值为 1
        this.jumpToImage();
      } else {
        this.jumpToImage();
      }
    },
    imgType(eve) {
      var indexs = this.groups.findIndex((item) => item.name == eve);
      this.selectGroup(indexs, 0);
    },
    hide() {
      this.imglistshow = true;
    },
    fullScreen() {
      this.imgFullscreen = true;
      document.addEventListener("keydown", this.handleKeydown); // 添加键盘事件监听
    },
    handleKeydown(event) {
      if (event.key === "Escape") {
        this.closePreview();
      }
    },
    closePreview() {
      this.imgFullscreen = false;
      document.removeEventListener("keydown", this.handleKeydown); // 移除键盘事件监听
    },
    groupImages(option) {
      let grouped = [];
      this.activeName = [];
      switch (option) {
        case "无分组":
          grouped = [{ name: "所有照片", images: this.imagedata }];
          break;
        case "按照片类型分组":
          grouped = this.imagedata.reduce((acc, item) => {
            let group = acc.find(
              (g) => g.name === `照片类型：${item.filetype}`
            );
            if (!group) {
              group = { name: `照片类型：${item.filetype}`, images: [] };
              acc.push(group);
            }
            group.images.push(item);
            return acc;
          }, []);
          break;
        case "按拍摄人员分组":
          grouped = this.imagedata.reduce((acc, item) => {
            let group = acc.find(
              (g) => g.name === `拍摄人员：${item.photographer}`
            );
            if (!group) {
              group = { name: `拍摄人员：${item.photographer}`, images: [] };
              acc.push(group);
            }
            group.images.push(item);
            return acc;
          }, []);
          break;
        case "按拍摄月份分组":
          grouped = this.imagedata.reduce((acc, item) => {
            let month = new Date(item.createtime).getMonth() + 1;
            let group = acc.find((g) => g.name === `拍摄月份：${month}月`);
            if (!group) {
              group = { name: `拍摄月份：${month}月`, images: [] };
              acc.push(group);
            }
            group.images.push(item);
            return acc;
          }, []);
          break;
        case "按拍摄年份分组":
          grouped = this.imagedata.reduce((acc, item) => {
            let year = new Date(item.createtime).getFullYear();
            let group = acc.find((g) => g.name === `拍摄年份：${year}年`);
            if (!group) {
              group = { name: `拍摄年份：${year}年`, images: [] };
              acc.push(group);
            }
            group.images.push(item);
            return acc;
          }, []);
          break;
        case "图斑编号":
          grouped = this.imagedata.reduce((acc, item) => {
            let group = acc.find(
              (g) => g.name === `图斑编号：${item.tbbh}`
            );
            if (!group) {
              group = { name: `图斑编号：${item.tbbh}`, images: [] };
              acc.push(group);
            }
            group.images.push(item);
            return acc;
          }, []);
          break;
        default:
          grouped = [{ name: "所有照片", images: this.imagedata }];
      }
      this.groups = grouped;
      this.groups.forEach((element) => {
        this.activeName.push(element.name);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.imgbody {
  width: 100%;
  height: 100%;
  position: relative;

  .imglist {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    overflow-y: auto;
    ::v-deep .el-collapse-item__header {
      display: block;
      background-color: #f5f5f9;
      color: #409eff;
      .el-collapse-item__arrow {
        margin: 0;
        margin-left: 10px;
      }
      .type {
        padding-left: 10px;
      }
      .nums {
        float: right;
        padding-right: 10px;
        color: black;
        font-size: 16px;
      }
    }

    ::v-deep .el-collapse-item__content {
      display: flex;
      box-sizing: border-box;
      flex-wrap: wrap;
      justify-content: flex-start;
      .item {
        width: 160px;
        height: 110px;
        margin: 10px 10px 0;
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        img {
          width: 100%;
          height: 100%;
        }
        span {
          position: absolute;
          bottom: 0;
          display: inline-block;
          z-index: 1;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          width: 100%;
          text-align: center;
          left: 0;
        }
        span:last-child {
          color: red;
        }
      }
      .items {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f5f9;
        width: 140px;
        height: 110px;
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        float: left;
        margin: 10px 10px 0;
        span {
          color: #409eff;
          font-size: 18px;
        }
      }
    }
  }
  .preview-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
    .toolbar {
      width: 280px;
      height: 40px;
      position: absolute;
      bottom: 10px;
      left: 50%;
      margin-left: -140px;
      z-index: 10;
      padding: 0 20px;
      box-sizing: border-box;
      background-color: #36383a;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-radius: 50px;
      i {
        font-size: 25px;
        color: white;
      }
    }

    .image-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .image-wrapper img {
      max-width: 100%;
      max-height: 100%;
      transition: transform 0.3s ease;
    }
    .image-info {
      position: absolute;
      right: 10px;
      top: 10px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #409eff;
      height: 30px;
      width: 100px;
      color: white;
      border-radius: 5px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      .imageindex {
        width: 30px;
        border: none;
        text-align: center;
        outline: none; /* 防止浏览器默认的聚焦边框 */
        transition: border 0.2s ease; /* 添加平滑过渡效果 */
      }
      ::v-deep .imageindex:focus {
        border: none;
        box-shadow: none; /* 确保不会出现阴影 */
      }
      /* 隐藏 Chrome 和 Safari 中的数字调整按钮 */
      .imageindex::-webkit-outer-spin-button,
      .imageindex::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* 隐藏 Firefox 中的数字调整按钮 */
      .imageindex[type="number"] {
        -moz-appearance: textfield;
      }
    }
    .image-back {
      position: absolute;
      left: 10px;
      top: 10px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .image-group {
      width: 280px;
      position: absolute;
      left: 50%;
      margin-left: -140px;
      top: 10px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      background-color: #606266;
      color: white;
      height: 30px;
      line-height: 40px;
      padding: 0 20px;
      border-radius: 50px;
      box-sizing: border-box;
      overflow: hidden;
      ::v-deep .el-select--mini {
        flex: 1;
        background-color: #606266;
        .el-input--mini {
          background-color: #606266;
          .el-input__inner {
            background-color: #606266;
            border: none;
            color: white;
          }
          .el-input__inner::placeholder {
            color: white; /* 设置为你需要的颜色，例如橙红色 */
            opacity: 1; /* 保证颜色不透明 */
          }
        }
      }
    }
    .image-leftbt {
      position: absolute;
      height: 50px;
      width: 50px;
      top: 50%;
      margin-top: -25px;
      left: 10px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      ::v-deep .el-icon-caret-left {
        font-size: 25px;
      }
    }
    .image-rightbt {
      position: absolute;
      height: 50px;
      width: 50px;
      top: 50%;
      margin-top: -25px;
      right: 10px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      ::v-deep .el-icon-caret-right {
        font-size: 25px;
      }
    }

    .image-number {
      font-size: 14px;
    }
  }
  .bottomfy {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    height: 30px;
    line-height: 26px;
    background: rgba(0, 0, 0, 0.6);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    padding: 0px 10px;
    box-sizing: border-box;
    z-index: 10;
    .el-button--mini,
    .el-button--mini.is-round {
      padding: 3px;
    }
    .el-radio-group {
      position: absolute;
      left: 10px;
      display: flex;
      background: white;
      top: -190px;
      flex-direction: column;
      border: 1px solid #dcdcdc;
      border-radius: 10px;
      .el-radio {
        margin: 10px;
      }
    }
    .imgae-form-inline {
      position: absolute;
      left: 100px;
      top: -230px;
      border: 1px solid #dcdcdc;
      border-radius: 10px;
      padding: 10px;
      box-sizing: border-box;
      background: white;
      width: 350px !important;
      height: 220px !important;
      ::v-deep .el-form-item__content {
        display: flex;
        align-items: center;
        .el-input {
          width: 100%;
        }
      }
    }
    .sxjgcla {
      color: white;
      line-height: 30px;
      font-size: 14px;
      padding-left: 10px;
    }
  }
  /* 全屏预览样式 */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .toolbar {
      width: 280px;
      height: 40px;
      position: absolute;
      bottom: 10px;
      left: 50%;
      margin-left: -140px;
      z-index: 10;
      padding: 0 20px;
      box-sizing: border-box;
      background-color: #36383a;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-radius: 50px;
      i {
        font-size: 25px;
        color: white;
      }
    }
  }
  .overlay img {
    max-width: 90%;
    max-height: 90%;
    user-select: none; /* 禁止选中文字 */
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease;
  }
  .overlay .close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 24px;
    color: white;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.6);
    padding: 5px 10px;
    border-radius: 5px;
    z-index: 10001;
  }
}
</style>
