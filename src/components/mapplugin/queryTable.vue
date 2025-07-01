<template>
  <div class="query-table">
    <!-- -->
    <el-table
    :key="tableDataKey"
      :data="pagedData"
      style="width: 100%"
      height="100%"
      highlight-current-row
      @current-change="tableCurrentChange"
    >
      <el-table-column
        v-for="(item, index) in columObj.columnData"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width || '180'"
      show-overflow-tooltip	

      >
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageObj.PageIndex"
      :page-sizes="[20, 50, 100]"
      :page-size="pageObj.PageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageObj.total"
    >
    </el-pagination>
  </div>
</template>

<script>
import eltable from "../table/index";
export default {
  name: "ForestChiefSystemWebQueryTable",
  components: {
    eltable,
  },
  computed: {
  },
  watch: {
    TableData(newVal) {
        this.tableDataKey++
      // 当TableData变化时，更新分页总数
      this.pageObj.total = newVal.length;
      this.pageObj.PageIndex = 1; // 重置到第一页
      this.getdata(); // 重新获取数据
    },
    columObj(newVal) {
      // 当columObj变化时，强制更新表格
      this.tableDataKey++;
    },
  },
  props: {
    TableData: {
      type: Array,
      default: () => [],
    },
    columObj: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      pageObj: {
        PageIndex: 1,
        PageSize: 20,
        total: 0,
      },
      pagedData: [], // 分页数据
      tableDataKey: 0, // 用于强制更新表格
    };
  },

  mounted() {
    // 初始化分页数据
    this.pageObj.total = this.TableData.length;
    this.pageObj.PageIndex = 1;
    this.pageObj.PageSize = 20;
  },


  methods: {
    handleSizeChange(val) {
      this.pageObj.PageSize = val; // 重置到第一页
      this.getdata()
    },
    handleCurrentChange(val) {
      this.pageObj.PageIndex = val;
      this.getdata()
    },
    sortchange() {
      // 处理排序变化
      console.log("排序变化");
    },
    tableCurrentChange(row) {
      // 处理当前行变化
      this.$emit("current-change", row);
    },
    getdata() {
      const start = (this.pageObj.PageIndex - 1) * this.pageObj.PageSize;
      this.pagedData = this.TableData.slice(start, start + this.pageObj.PageSize);
    
    },
  },
};
</script>

<style lang="scss" scoped>
.query-table {
  height: 300px;
  width: 90%;
  margin: 0 auto;
  bottom: 20px;
  background: white;
  position: absolute;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  left: 5%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 5px;
  box-sizing: border-box;
}
</style>