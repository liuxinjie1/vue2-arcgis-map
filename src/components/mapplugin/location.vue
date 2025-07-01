<template>
  <div class="location-container">
    <div class="title">定位</div>
    <el-radio-group v-model="type" size="mini" class="location-type">
      <el-radio-button label="坐标"></el-radio-button>
      <el-radio-button label="文件"></el-radio-button>
    </el-radio-group>
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      size="mini"
      class="location-form"
    >
      <el-form-item label="坐标系">
        <el-select v-model="coordinatesystem" placeholder="请选择" size="mini">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上传文件" v-show="type === '文件'">
        <el-upload
          class="upload-demo"
          ref="upload"
          action="https://jsonplaceholder.typicode.com/posts/"
          :file-list="fileList"
          :auto-upload="false"
          size="mini"
          :limit="1"
        >
          <el-button slot="trigger" type="primary">选取文件</el-button>

          <div slot="tip" class="el-upload__tip">
            只能上传shp文件，且不超过500kb
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item label="x坐标" v-show="type === '坐标'">
        <el-input v-model="form.x"></el-input>
      </el-form-item>
      <el-form-item label="y坐标" v-show="type === '坐标'">
        <el-input v-model="form.y"></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini">定位</el-button>
  </div>
</template>

<script>
export default {
  name: "ForestChiefSystemWebLocation",

  data() {
    return {
      form: {
        x: "",
        y: "", // 默认坐标
      },
      type: "文件", // 默认选中上海
      coordinatesystem: "WGS84", // 默认坐标系
      options: [
        { value: "WGS84", label: "WGS84" },
        { value: "CGCS2000", label: "CGCS2000" },
        { value: "GCJ02", label: "GCJ02" },
        { value: "BD09", label: "BD09" },
      ],
      fileList: [], // 文件列表
    };
  },

  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.location-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  z-index: 1000;
  .location-form{
    margin: 10px 0;
  }
  .location-type{
    margin: 10px 0;
  }
}
</style>