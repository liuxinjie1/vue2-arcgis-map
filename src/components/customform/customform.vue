<template>
  <el-form
    :model="formData"
    :label-position="labelPosition"
    :label-width="labelWidth"
    :inline="inline"
    :size="size"
    ref="form"
  >
    <el-row :gutter="20">
      <el-col
        v-for="(item, index) in config"
        :key="index"
        :span="item.span || getDefaultSpan(itemsPerRow)"
      >
        <el-form-item
          v-if="item.label"
          :label="item.label"
          :prop="item.prop"
          :style="{ width: '100%' }"
          :rules="item.rules"
        >
          <component
            :is="item.type"
            v-model="formData[item.prop]"
            v-bind="item.attrs"
            :style="{ width: 'calc(100%)' }"
            :disabled="item.disabled"
            :readonly="item.readonly"
            @change="handleChange(item.prop, $event)"
            v-if="item.type != 'el-radio-group'"
          >
            <!-- 渲染 options 的逻辑 -->
            <el-option
              v-if="item.type === 'el-select' && item.options"
              v-for="(option, optIndex) in item.options"
              :key="optIndex"
              :label="option.label"
              :value="option.value"
            />
          </component>
          <!-- el-radio-group 放在 component 外部 -->
          <el-radio-group
            v-if="item.type === 'el-radio-group'"
            v-model="formData[item.prop]"
            :style="{ width: '100%' }"
            :disabled="item.disabled"
            :readonly="item.readonly"
            @change="handleChange(item.prop, $event)"
          >
            <el-radio
              v-for="(option, optIndex) in item.options"
              :key="option.value || optIndex"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 如果没有 label，直接渲染输入组件 -->
        <component
          v-else
          :is="item.type"
          v-model="formData[item.prop]"
          v-bind="item.attrs"
          @change="handleChange(item.prop, $event)"
          :disabled="item.disabled"
          :readonly="item.readonly"
        >
          <el-option
            v-if="item.type === 'el-select' && item.options"
            v-for="(option, optIndex) in item.options"
            :key="optIndex"
            :label="option.label"
            :value="option.value"
          />
        </component>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  name: "CustomForm",
  props: {
    config: {
      type: Array,
      required: true,
    },
    formData: {
      type: Object,
      required: true,
    },
    labelPosition: {
      type: String,
      default: "right",
    },
    labelWidth: {
      type: String,
      default: "100px",
    },
    inline: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "mini",
    },
    itemsPerRow: {
      type: Number,
      default: 4,
      validator: (value) => value >= 1 && value <= 4,
    },
  },
  contentWidth() {
    // 计算剩余的内容区域宽度（假设外部容器宽度为 600px）
  },
  methods: {
    getDefaultSpan(itemsPerRow) {
      return Math.floor(24 / itemsPerRow);
    },
    handleChange(prop, event) {
      const item = this.config.find((conf) => conf.prop === prop);
      if (item && item.onChange) {
        item.onChange(event, this.formData);
      }
    },
    handleSubmit() {
      let valids = null;
      this.$refs.form.validate((valid) => {
        if (valid) {
          console.log("表单验证成功");
        } else {
          console.log("表单验证失败");
        }
        valids = valid;
      });
      return valids;
    },
  },
  mounted() {
    /*    
    使用示例 
      formConfig: [
        {
          prop: "name",
          label: "姓名",
          type: "el-input",
          span: 12,
          attrs: { placeholder: "请输入姓名" },
          disabled: false,
          readonly: true,
          rules: [
            { required: true, message: "请输入用户名", trigger: "blur" },
            { min: 4, message: "用户名最少需要 4 个字符", trigger: "blur" },
          ], // 验证规则
        },
        {
          prop: "age",
          label: "年龄",
          type: "el-input-number",
          span: 12,
          attrs: { placeholder: "请输入年龄", min: 0 },
          disabled: false,
          readonly: true,
        },
        {
          prop: "gender",
          label: "性别",
          type: "el-radio-group",
          options: [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
          span: 12,
          disabled: false,
          readonly: false,
        },
        {
          prop: "region",
          label: "地区",
          type: "el-cascader",
          span: 12,
          attrs: {
            placeholder: "请选择地区",
            options: [
              {
                value: "zhongguo",
                label: "中国",
                children: [
                  {
                    value: "beijing",
                    label: "北京",
                  },
                  {
                    value: "shanghai",
                    label: "上海",
                  },
                ],
              },
              {
                value: "meiguo",
                label: "美国",
                children: [
                  {
                    value: "newyork",
                    label: "纽约",
                  },
                  {
                    value: "losangeles",
                    label: "洛杉矶",
                  },
                ],
              },
            ],
          },
          disabled: false,
          readonly: false,
        },
        {
          prop: "startTime",
          label: "开始时间",
          type: "el-date-picker",
          span: 12,
          attrs: { placeholder: "请选择时间", type: "date" },
          disabled: false,
          readonly: false,
        },
        {
          prop: "startTime",
          label: "结束时间",
          type: "el-date-picker",
          span: 12,
          attrs: { placeholder: "请选择时间", type: "date" },
          disabled: false,
          readonly: false,
        },
        {
          prop: "startTime",
          label: "上报执法结果",
          type: "el-input",
          span: 24,
          attrs: { placeholder: "请选择时间", type: "textarea" },
          disabled: false,
          readonly: false,
        },
      ],
 */
  },
};
</script>
<style lang="scss" scoped>
.el-form {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .el-row {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0 !important;
    .el-col {
      box-sizing: border-box;
      ::v-deep .el-form-item__content {
      }
    }
  }
}
</style>

