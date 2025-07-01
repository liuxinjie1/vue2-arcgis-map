<template>
  <div class="query-layer">
    <div class="title">查询</div>
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      class="query-form"
      size="mini"
      :rules="fromrules"
    >
      <!-- <el-form-item label="活动名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item> -->
      <el-form-item label="查询图层" prop="layerid">
        <el-select
          v-model="form.layerid"
          placeholder="请选择查询图层"
          @change="selectedlayer"
        >
          <el-option
            v-for="(layer, index) in layeroptions"
            :label="layer.label"
            :value="layer.id"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否显示" prop="isshow">
        <el-switch v-model="form.isshow"></el-switch>
      </el-form-item>
      <el-form-item label="查询方式" prop="manner">
        <el-radio-group v-model="form.manner">
          <el-radio label="点击"></el-radio>
          <el-radio label="拉框"></el-radio>
          <el-radio label="多边形"></el-radio>
          <el-radio label="属性"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="缓冲区"
        prop="buffer"
        v-show="form.manner !== '属性'"
      >
        <el-input v-model="form.buffer" @input="onInput">
          <template slot="append">米</template>
        </el-input>
      </el-form-item>
      <el-form-item label="字段列表" v-show="form.manner === '属性'">
        <el-input
          type="textarea"
          v-model="form.fields"
          :readonly="true"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="条件"
        v-show="form.manner === '属性'"
        prop="condition"
      >
        <el-input type="textarea" v-model="form.condition"></el-input>
      </el-form-item>
    </el-form>

    <el-button
      type="primary"
      @click="draws"
      size="mini"
      >{{bttxt}}</el-button
    >
  </div>
</template>

<script>
export default {
  name: "ForestChiefSystemWebQueryLayer",
  props: {
    fields: {
      type: String,
      default: "",
    },
  },
  beforeDestroy() {
    this.$emit("querylayerdestroy"); // 组件销毁时触发事件
    let item = this.layeroptions.find((item) => item.id === this.form.layerid);
    item["isshow"] = false; // 清除之前的选中图层
    this.$emit("deletelayer", item); // 清除之前的选中图层    // 清理工作
  },

  data() {
    return {
      bttxt: "点击", // 按钮文本
      form: {
        layerid: "",
        isshow: true,
        manner: "点击",
        buffer: 0,
        fields: "",
        condition: "",
      },
      fromrules: {
        layerid: [
          { required: true, message: "请选择查询图层", trigger: "change" },
        ],
        manner: [
          { required: true, message: "请选择查询方式", trigger: "change" },
        ],
      },
      layeroptions: [
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
    };
  },

  watch: {
    // 监听 form.layerid 的变化
    "form.layerid": function (newVal, oldVal) {
      if (oldVal) {
        let item = this.layeroptions.find((item) => item.id === oldVal);
        item["isshow"] = false; // 清除之前的选中图层
        this.$emit("deletelayer", item); // 清除之前的选中图层
      }
      if (newVal) {
        let item = this.layeroptions.find((item) => item.id === newVal);
        item["isshow"] = this.form.isshow; // 清除之前的选中图层
        this.$emit("selectedlayer", item);
      }
    },
    "form.isshow": function (newVal, oldVal) {
      let item = this.layeroptions.find(
        (item) => item.id === this.form.layerid
      );
      item["isshow"] = newVal; // 显示图层
      this.$emit("selectedlayer", item);
    },
    "form.manner": function (newVal, oldVal) {
      if (newVal === "属性") {
        this.bttxt = "查询"; // 如果查询方式为属性，按钮文本改为查询
      } else if (newVal === "点击") {
        this.bttxt = "选中"; // 如果查询方式为点击，按钮文本改为点击查询
      } else {
        this.bttxt = "绘制"; // 否则为绘制
      }
      // 清除字段列表
    },
    fields(newVal, oldVal) {
      // 当 fields 变化时，更新 form.fields
      this.form.fields = newVal;
    },
    form: {
      handler(newVal, oldVal) {
        // 当 form 变化时，更新 fields
        this.$emit("updateform", newVal);
      },
      deep: true, // 深度监听
    },
  },

  mounted() {
    this.form.fields = this.fields; // 初始化字段列表
    this.$emit("updateform", this.form); // 初始化时触发一次更新
  },

  methods: {
    selectedlayer(val) {
      let item = this.layeroptions.find((item) => item.id === val);
    },

    querydata() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 触发查询事件
          this.$emit("tipschange", null, "属性", this.form);
        } else {
          this.$message.error("请填写完整的查询信息");
        }
      });
    },
    draws() {
      let valids = true;
      this.$refs.form.validate((valid) => {
        valids = valid;
      });
      if (!valids) {
        return;
      }
      if (this.form.manner === "点击") {
        this.$emit(
          "tipschange",
          "点击查询方式需要在地图上点击查询",
          "点击",
          this.form
        );
      } else if (this.form.manner === "拉框") {
        this.$emit(
          "tipschange",
          "拉框查询方式需要在地图上拉框查询",
          "拉框",
          this.form
        );
      } else if (this.form.manner === "多边形") {
        this.$emit(
          "tipschange",
          "多边形查询方式需要在地图上绘制多边形查询",
          "多边形",
          this.form
        );
      } else if (this.form.manner === "属性") {
        this.$emit("tipschange", null, "属性", this.form);
      }
    },
    onInput(val) {
      // 只允许输入数字和最多一个小数点
      if (!val) {
        this.form.buffer = 0; // 如果输入为空，设置为0
        return;
      }
      const cleanVal = val
        .replace(/[^\d.]/g, "") // 移除非数字和小数点
        .replace(/^(\d*\.\d*).*$/, (_, match) => match) // 限制只有一个小数点
        .replace(/^\./, ""); // 不允许第一个字符为小数点
      this.form.buffer = parseFloat(cleanVal); // 确保是字符串类型
      if (this.form.buffer < 0) {
        this.form.buffer = 0; // 确保缓冲区值不小于0
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.query-layer {
  width: 450px;
  //   height: 500px;
  height: auto;
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    font-size: 20px;
    font-weight: bold;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    padding-bottom: 10px;
    width: 100%;
    text-align: left;
  }
  .query-form {
    margin: 10px 0;
    width: 100%;
  }
}
</style>