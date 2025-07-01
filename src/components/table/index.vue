<template>
  <div class="public-table">
    <!-- 具体使用方法参考public-table-demo.vue -->
    <div class="list-table-cont">
      <div class="list-table">
        <el-table
          @selection-change="handleSelectionChange"
          @cell-click="cell_click"
          @row-dblclick="row_dblclick"
          :header-cell-style="tableheaderstyle"
          @sort-change="sort_change"
          :data="tableData"
          :stripe="true"
          :border="false"
          :fit="true"
          :show-header="true"
          :highlight-current-row="true"
          v-loading="columObj.loading"
          :row-class-name="tableRowClassName"
          :cell-style="{ height: columObj.rowheight + 'px', padding: 0 }"
          class="public-table-cont"
          height="100%"
        >
          <!-- 选择框是否开启，selectable控制是否单行禁用 -->
          <el-table-column
            v-if="columObj.selection"
            type="selection"
            align="center"
            :selectable="columObj.selectable"
            width="60"
          />
          <!-- 序号是否开启，selectable控制是否单行禁用 -->
          <el-table-column
            v-if="columObj.sorting"
            type="index"
            label="序号"
            align="center"
            width="50"
          >
            <template slot-scope="{ $index }">
              {{ indexMethod($index) }}
            </template>
          </el-table-column>

          <!-- 普通列 -->
          <el-table-column
            v-for="(column, columIndex) in columObj.columnData"
            :key="columIndex"
            :prop="column.prop"
            :label="column.label"
            :minWidth="column.width"
            :fixed="column.fixed"
            :align="column.align || 'left'"
            :sortable="column.sortable"
            :index="columIndex"
            show-overflow-tooltip
          >
            <template slot="header">
              {{ column.label }}
              <el-popover
                v-show="column.isQuestion"
                placement="top-start"
                title=""
                width="200"
                trigger="hover"
                :content="column.questionCont"
              >
                <i class="el-icon-question" slot="reference"></i>
              </el-popover>
            </template>
            <template slot-scope="{ row, $index }">
              <!-- 默认数据展示，类型为text:true -->
              <span
                v-if="column.text && column.editRow != $index"
                :style="`color:${column.textColor}`"
              >
                {{ row[column.prop] || "—" }}
              </span>
              <!-- 对象展示，类型为status:true -->
              <span v-if="column.status && row[column.prop]">{{
                row[column.prop].msg || "—"
              }}</span>
              <!-- 自定义内容,数据需要通过自己特殊处理的，类型为slot:true -->
              <slot v-if="column.slot" :name="row[column.prop]" :row="row">
                <span v-html="column.format(row, $index)"></span>
              </slot>
              <!-- 自定义内容,数据需要通过自己特殊处理的，类型为slot:true -->
              <slot
                v-if="column.callbackprop"
                :name="row[column.prop]"
                :row="row"
              >
                <span v-html="column.format(row[column.prop], $index)"></span>
              </slot>
              <!-- 自定义格式返回，比如状态，时间拼接等，类型为ownDefined:true-->
              <span
                v-if="column.ownDefined"
                :style="column.formatColor && column.formatColor(row)"
              >
                {{ column.format(row, $index) || "—" }}
              </span>
              <!--数据有点击事件，可进行点击跳转，弹框等操作,类型为clickable：true -->
              <span
                v-if="column.clickable"
                :class="column.textClass"
                @click="column.itemClick(row, $index)"
                class="click-style"
              >
                {{ column.format(row, $index) || "—" }}
              </span>
              <!-- 返回的数据是简单的数组，类型为isArray：true -->
              <span v-if="column.isArray">
                <span v-for="(item, index) in row[column.prop]" :key="index">
                  {{
                    row[column.prop].length - 1 !== index
                      ? item + "，"
                      : item || "—"
                  }}
                </span>
              </span>
              <!-- 既有默认的返回数据，又有自定义的可点击内容，类型为textClick:true -->
              <span v-if="column.textClick">
                <span>{{ row[column.prop] || "—" }}</span>
                <span class="blue-line">|</span
                ><span
                  class="click-style"
                  @click="column.itemClick(row, $index)"
                  :class="column.textClass"
                  >{{ column.textCont || "—" }}</span
                >
              </span>
              <!-- switch开关,打开时值为true ，关闭时值为false  -->
              <el-switch
                v-if="column.switch"
                v-model="row[column.prop]"
                :inactive-text="
                  row[column.prop] ? column.openText : column.closeText
                "
                @change="switchChange(row, $index)"
              />
              <!-- switch开关,打开时值为1 ，关闭时值为0 -->
              <el-switch
                v-if="column.switchNum"
                :active-value="1"
                :inactive-value="0"
                v-model="row[column.prop]"
                :inactive-text="
                  row[column.prop] ? column.openText : column.closeText
                "
                @change="switchChange(row, $index)"
              />

              <!-- 单个图片展示，类型为image:true -->
              <div
                class="logo-box flex-column-center-center"
                v-if="column.image"
              >
                <el-image
                  class="logo"
                  :class="column.imgStyle"
                  :src="row[column.prop]"
                  :preview-src-list="[row[column.prop]]"
                  alt="图片"
                />
              </div>
              <!-- 图片数组 -->
              <div
                class="logo-box flex-column-center-center"
                v-if="column.imageArr"
              >
                <el-image
                  class="logo"
                  :class="column.imgStyle"
                  v-if="row[column.prop].length > 0"
                  :src="row[column.prop][0]"
                  :preview-src-list="row[column.prop]"
                  alt="图片"
                />
              </div>
              <!-- 操作按钮 -->
              <!-- <span
                v-show="column.isOperation"
                v-for="(operations, index) in column.operation"
                :key="index"
              >
                <el-button
                  :icon="operations.icon"
                  :type="operations.type"
                  @click="operations.buttonClick(row, $index)"
                  :class="
                    operations.format && operations.format(row)
                      ? operations.disabledClass
                      : operations.styleClass
                  "
                  :disabled="operations.format && operations.format(row)"
                  size="small"
                  >{{ operations.label }}</el-button
                >
                <span v-show="operations.dividerLine" class="divider-line"
                  >|</span
                >
              </span> -->
            </template>
          </el-table-column>
          <!-- 自定义操作栏，与isOperation不能同时存在-->
          <slot name="tableOperations"></slot>
          <!-- 暂无数据 -->
          <div slot="empty" class="empty">
            <!-- <img :src="`${ASSET_HOST}/event/activity_null.png`" /> -->
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <!-- noPagination为true时不显示分页，默认为false，可不传此参数 -->
      <div class="pagination-panel flex-end" v-show="!columObj.noPagination">
        <div
          class="total-pages"
          :style="{ textAlign: pageObj.position || 'center' }"
        >
          <div>
            共
            <span>{{ pageObj.total }}</span> 条
          </div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageObj.PageIndex"
            :page-size="pageObj.PageSize"
            background
            layout="sizes, prev, pager, next,jumper"
            :total="pageObj.total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "public-table", //共用table组件
  directives: {
    // 自定义指令,用于可编辑input自动获取焦点
    focus: {
      inserted: function (e) {
        e.querySelector("input").focus();
      },
    },
  },
  props: {
    tableData: {
      type: Array,
      required: true,
    },
    columObj: {
      type: Object,
      required: true,
    },
    //columObj.type(如果为""空，就不会加载多选框，或者index编号),lazy(是否支持懒加载)
    //columnData.columType(列类型,可选text(默认为普通文字模式),input(input可编辑框),switch(switch开关),image(图片),operation(操作按钮))
    //prop(参数),label(列名),width(宽度),align(对齐方式),sortable(是否支持排序)
    //如果为操作列,则需要填写需要的操作按钮,类型为Object。type(按钮样式,参考el—botton类型),label(按钮文字)icon(参考el-icon),color(字体颜色),buttonClick为点击后调用的方法名称
    pageObj: {
      type: Object,
      required: true,
    },
  },

  methods: {
    // switchChange调用
    switchChange(row, $index, prop) {
      this.$emit("switchChange", row, $index, prop);
    },
    // 帮助点击行，获取点击的下标
    tableRowClassName({ row, rowIndex }) {
      row.rowIndex = rowIndex;

      return "row-class-height" + this.columObj.rowheight.toString();
    },
    // 选择的数据
    handleSelectionChange(val) {
      this.$emit("handleSelectionChange", val);
    },
    // 条数变化
    handleSizeChange(e) {
      this.$emit("handleSizeChange", e);
    },
    // 页码变化
    handleCurrentChange(e) {
      this.$emit("handleCurrentChange", e);
    },
    //行点击事件
    cell_click(row, column, cell, event) {
      this.$emit("cell_click", row, column, cell, event);
    },
    row_dblclick(row, column, cell, event) {
      this.$emit("row_dblclick", row, column, cell, event);
    },
    indexMethod(index) {
      
      return index + this.pageObj.PageSize * (this.pageObj.PageIndex - 1) + 1;
    },
    tableheaderstyle() {
      return { background: "#DAE8F8", color: "rgb(80, 82, 85)" };
    },
    sort_change(event) {
      this.$emit("sort_change", event);
    },
  },
};
</script>

<style lang="scss" scoped>
.public-table-cont {
  height: 100%;
}
.public-table {
  width: 100%;
  height: 100%;
  .list-table-cont {
    height: 100%;
    width: 100%;
    .list-table {
      // position: relative;
      height: 95%;
      width: 100%;
    }
  }
  .el-button {
    margin: 0 6px;
  }
  .text-underline {
    text-decoration: underline;
  }
  .click-style {
    cursor: pointer;
  }
  .text-color {
    color: #0064ff;
  }
  .red-text {
    color: red !important;
  }

  .blue-text {
    color: rgba(0, 100, 255, 1) !important;
  }

  .disabled-text {
    color: #999 !important;
  }
  ::v-deep .el-input__inner {
    // border: none;
  }

  ::v-deep .el-image__inner {
    height: 50px;
  }
  // switch左边文字颜色
  ::v-deep .el-switch__label--left {
    color: #606266;
  }
  .flex-column-center-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .logo-box {
    width: 50px;
    height: 50px;
    ::v-deep.el-image__inner {
      height: auto !important;
    }
    .logo {
      width: 50px;
      height: 50px;
      display: inline-block;
      object-fit: cover;
    }
    .logo-style {
      height: 40px !important;
    }
    .logo-list-style {
      width: 80px !important;
      height: 80px !important;
    }
  }
}
.flex-end {
  height: 5%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.total-pages {
  display: flex;
  color: #606266;
  font-size: 13px;
  align-items: center;
}
</style>
