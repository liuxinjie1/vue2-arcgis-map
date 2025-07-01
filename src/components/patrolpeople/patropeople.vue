<template>
  <div class="patropeople">
    <div class="patrol-list">
      <div
        class="patrol-item"
        v-for="item in patrolList"
        :key="item.id"
        @dblclick="handleDoubleClick(item)"
      >
        <div class="avatar-section">
          <el-avatar :size="60" :src="item.avatar">
            <img src="@/assets/image/default-avatar.png" />
          </el-avatar>
        </div>
        <div class="info-section">
          <div class="basic-info">
            <div class="name">{{ item.appusername }}</div>
            <div class="department">{{ item.realname }}</div>
          </div>
          <div class="contact-info">
            <div class="phone">
              <i class="el-icon-phone"></i>
              {{ item.appphone }}
            </div>
            <div class="patrol-count">
              <span class="label">巡查次数：</span>
              <span class="count">{{
                item.patrolCount ? item.patrolCount : 0
              }}</span>
            </div>
          </div>
          <div class="additional-info">
            <!-- <div class="info-item">
              <span class="label">工号：</span>
              <span>{{ item.employeeId?item.employeeId:'' }}</span>
            </div> -->
            <div class="info-item">
              <span class="label">职位：</span>
              <span>{{ item.unitname ? item.unitname : "" }}</span>
            </div>
          </div>
        </div>
        <div class="action-section">
          <el-button
            type="primary"
            size="small"
            @click.stop="viewDetail(item)"
            @dblclick.stop.native
            >负责区域</el-button
          >
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <!-- <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div> -->
  </div>
</template>

<script>
export default {
  name: "ForestChiefSystemWebPatropeople",
  props: {
    patrolList: {
      default: () => [],
    },
  },

  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      total: 5,
    };
  },

  mounted() {
    this.getPatrolPeopleList();
    this.total = this.patrolList.length;
  },

  methods: {
    // 获取巡查人员列表
    async getPatrolPeopleList() {
      try {
        // 这里调用接口获取数据
        // const res = await this.$api.getPatrolPeopleList({
        //   page: this.currentPage,
        //   pageSize: this.pageSize
        // });
        // this.patrolList = res.data.list;
        // this.total = res.data.total;
      } catch (error) {
        this.$message.error("获取巡查人员列表失败");
        console.error(error);
      }
    },

    // 查看详情
    viewDetail(item, e) {
      console.log(JSON.stringify({
        spatialReference: { latestWkid: 4326, wkid: 4490 },
        rings: [
          [
            [117.66088071127916, 36.038783166361874],
            [117.66019406439806, 36.03380497647385],
            [117.65229762526535, 36.037924857760494],
            [117.66088071127916, 36.038783166361874],
          ],
        ],
      }));
      
      this.$emit("undertakeregion", item);
    },
    handleButtonDblClick(eve, event) {
      event.stopPropagation(); // 阻止 click 事件冒泡
      console.log("按钮被点击了");
    },
    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.pageSize = val;
      this.getPatrolPeopleList();
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getPatrolPeopleList();
    },
    handleDoubleClick(eve) {
      this.$emit("patropeopledouble", eve);
    },
  },
};
</script>

<style lang="scss" scoped>
.patropeople {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;

  .patrol-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;

    .patrol-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ebeef5;
      transition: all 0.3s;
      background: #fff;
      border-radius: 4px;
      margin-bottom: 10px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        background: #f5f7fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .avatar-section {
        margin-right: 20px;
        .el-avatar {
          border: 2px solid #409eff;
          box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
        }
      }

      .info-section {
        flex: 1;

        .basic-info {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .name {
            font-size: 18px;
            font-weight: bold;
            color: #303133;
            margin-right: 15px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .department {
            font-size: 14px;
            color: #909399;
            padding: 2px 8px;
            background: #f0f2f5;
            border-radius: 4px;
          }
        }

        .contact-info {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .phone {
            margin-right: 20px;
            color: #606266;
            display: flex;
            align-items: center;

            i {
              margin-right: 5px;
              color: #409eff;
              font-size: 16px;
            }
          }

          .patrol-count {
            .label {
              color: #606266;
            }
            .count {
              color: #409eff;
              font-weight: bold;
              font-size: 16px;
              margin-left: 5px;
            }
          }
        }

        .additional-info {
          display: flex;
          color: #606266;
          font-size: 14px;

          .info-item {
            margin-right: 20px;
            display: flex;
            align-items: center;

            .label {
              color: #909399;
              margin-right: 5px;
            }
          }
        }
      }

      .action-section {
        margin-left: 20px;
        .el-button {
          padding: 8px 20px;
          border-radius: 4px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    padding: 15px;
    display: flex;
    justify-content: flex-end;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    ::v-deep .el-pagination {
      .el-pagination__total,
      .el-pagination__sizes,
      .el-pagination__jump {
        margin-right: 10px;
      }

      .el-pagination__sizes .el-input .el-input__inner {
        border-radius: 4px;
      }

      button {
        background: transparent;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        &:hover {
          color: #409eff;
          border-color: #409eff;
        }
      }

      .el-pager li {
        border-radius: 4px;

        &:hover {
          color: #409eff;
        }

        &.active {
          background-color: #409eff;
          color: #fff;
        }
      }
    }
  }
}
</style>