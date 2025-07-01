<template>
  <div class="attachment-list-container">
    <div
      v-for="(item, index) in attachments"
      :key="index"
      class="attachment-group"
    >
      <div class="group-header" @click="toggleGroup(item.tbbh)">
        <span class="title">图斑编号：{{ item.tbbh }}</span>
        <div class="group-header-actions" @click.stop>
          <div class="upload-btn" @click="uploadFile(item)">
            <!-- <img
              src="@/assets/image/upload.png"
              class="upload-icon"
              alt="上传"
            /> -->
            <i class="el-icon-upload2"></i>
            <span>上传附件</span>
          </div>
        </div>
        <div @click.stop class="group-header-operate">
          <el-checkbox
            :indeterminate="item.isIndeterminate"
            v-model="item.checkedAll"
            @change="CheckedChange(item, null)"
            :disabled="item.fileList <= 0"
            >全选</el-checkbox
          >
          <el-button
            type="text"
            :disabled="item.isIndeterminate || item.checkedAll ? false : true"
            icon="el-icon-download"
            >下载</el-button
          >
          <el-button
            type="text"
            :disabled="item.isIndeterminate || item.checkedAll ? false : true"
            icon="el-icon-delete"
            style="margin-left: 0px"
            @click="EnforceFileDelete(item)"
            >删除</el-button
          >
        </div>

        <i v-if="!collapsedGroups[item.tbbh]" class="el-icon-arrow-right"></i>
        <i v-if="collapsedGroups[item.tbbh]" class="el-icon-arrow-down"></i>
      </div>
      <div v-show="collapsedGroups[item.tbbh]" class="attachment-list">
        <div
          v-for="fileitem in item.fileList"
          :key="fileitem.guid"
          class="attachment-item"
          @click="$emit('select-file', fileitem)"
        >
          <div class="icon">
            <!-- 可根据文件类型显示不同图标 -->
            <img :src="getFileIcon(fileitem.file_type)" class="icon-image" />
          </div>
          <div class="filename">
            <el-tooltip
              class="item"
              effect="dark"
              :content="fileitem.file_name"
              placement="top"
              :disabled="fileitem.file_name.length <= 9"
            >
              <span class="filename-text">{{ fileitem.file_name }}</span>
            </el-tooltip>
          </div>
          <div class="filecheck" @click.stop>
            <el-checkbox
              v-model="fileitem.checked"
              @change="CheckedChange(item, fileitem)"
            ></el-checkbox>
          </div>
        </div>
        <div v-if="item.fileList.length === 0" class="nullfile">
          暂无附件信息
        </div>
      </div>
    </div>
    <el-dialog
      title="上传文件"
      :visible.sync="dialogVisiblefile"
      width="30%"
      @close="handleClose"
    >
      <el-upload
        ref="uploadFile"
        class="upload-demo"
        drag
        action=""
        multiple
        :on-change="handlechange"
        :on-remove="handleRemove"
        :file-list="fileList"
        :auto-upload="false"
        accept=".jpg,.png,.pdf,.docx,.pptx,.zip,.xlsx,.txt"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
          只能上传jpg/png/pdf/docx/pptx/zip/xlsx/txt文件，且不超过500kb
        </div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisiblefile = false">取 消</el-button>
        <el-button type="primary" @click="upload">上传</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  EnforceFileInsert,
  EnforceFileList,
  EnforceFileDelete,
} from "../../api/foresmanagement";
export default {
  name: "AttachmentList",
  props: {
    attachments: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      collapsedGroups: {},
      dialogVisiblefile: false,
      fileList: [],
      uploadItem: {},
      checkedItem: null,
      deletefiles: [],
    };
  },
  computed: {
    // groupedAttachments() {
    //   // 按图斑编号分组
    //   return this.attachments.reduce((groups, item) => {
    //     const group = item.plotId || "未分组";
    //     if (!groups[group]) groups[group] = [];
    //     groups[group].push(item);
    //     return groups;
    //   }, {});
    // },
  },
  watch: {
    attachments: {
      handler(newVal) {
        // newVal.forEach((item) => {
        //   if (item.fileList.every((fileitem) => fileitem.checked === false)) {
        //     item.checkedAll = false;
        //     item.isIndeterminate = false;
        //   }
        //   if (
        //     item.fileList.every((fileitem) => fileitem.checked === true) &&
        //     item.fileList.length > 0
        //   ) {
        //     item.checkedAll = true;
        //     item.isIndeterminate = false;
        //   }
        //   if (
        //     item.fileList.some((fileitem) => fileitem.checked === true) &&
        //     item.fileList.some((fileitem) => fileitem.checked === false)
        //   ) {
        //     item.isIndeterminate = true;
        //     item.checkedAll = false;
        //   }
        // });
        // 重新初始化collapsedGroups
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    // 初始化collapsedGroups
    for (let index = 0; index < this.attachments.length; index++) {
      this.checkedItem = this.attachments[index];
      await this.getFileList();
    }
  },
  methods: {
    toggleGroup(group) {
      this.$set(this.collapsedGroups, group, !this.collapsedGroups[group]);
      if (this.collapsedGroups[group]) {
        this.checkedItem = this.attachments.find((item) => item.tbbh === group);
        if (this.checkedItem.fileList.length === 0) {
          // this.getFileList();
        }
      }
    },
    getFileIcon(type) {
      // 根据文件类型返回不同的icon图片路径
      if (type === "pdf") return require("../../assets/image/PDF.png");
      if (type === "doc" || type === "docx")
        return require("@/assets/image/WORD.png");
      if (type === "img" || type === "jpg" || type === "png")
        return require("@/assets/image/image.png");
      if (type === "xls" || type === "xlsx")
        return require("@/assets/image/Excel.png");
      if (type === "ppt" || type === "pptx")
        return require("@/assets/image/PPT.png");
      if (type === "txt") return require("@/assets/image/txt.png");
      return require("@/assets/image/FILE.png");
    },
    handleClose() {
      this.dialogVisiblefile = false;
      this.$refs.uploadFile.clearFiles();
    },
    uploadFile(e) {
      // const file = e.target.files[0];
      // if (file) {
      //   // 这里可以添加上传逻辑，比如调用API上传，并将文件与group关联
      //   // this.$emit("upload", { file, group });
      // }
      // 清空input，避免同一文件无法重复上传
      // e.target.value = "";
      this.dialogVisiblefile = true;
      this.uploadItem = e;
    },
    handlechange(file, fileList) {
      this.fileList = fileList;
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    upload() {
      // 这里可以添加上传逻辑，比如调用API上传
      // this.$emit("upload", { fileList: this.fileList });
      // this.dialogVisiblefile = false;
      this.uploadFileToServer();
    },
    async uploadFileToServer() {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const formData = new FormData();
      const index = this.attachments.findIndex(
        (item) => item.guid === this.uploadItem.pguid
      );
      let Is_Subplot = 2;
      if (index >= 0) {
        Is_Subplot = 1;
      }
      formData.append("Plot_Id", this.uploadItem.guid);
      formData.append("Is_Subplot", Is_Subplot);
      formData.append("Upload_User", userInfo.guid);
      this.fileList.forEach((file) => {
        formData.append("files[]", file.raw);
      });
      try {
        const loading = this.$loading({
          lock: true,
          text: "上传中...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        const res = await EnforceFileInsert(formData);
        if (res.code !== 200) {
          this.$message.error(res.msg);
          return;
        }
        loading.close();
        this.checkedItem = this.uploadItem;
        this.getFileList();
        this.$message.success("上传成功");
        this.dialogVisiblefile = false;
      } catch (error) {
        console.error("上传失败:", error);
        this.$message.error("上传失败");
      }
    },
    async getFileList() {
      let params = {
        guid: this.checkedItem.guid,
      };
      this.checkedItem.fileList = [];
      const res = await EnforceFileList(params);
      if (res.code === 200) {
        res.result.forEach((item) => {
          item["checked"] = false;
          this.checkedItem.fileList.push(item);
        });
      } else {
        this.$message.error(res.msg);
      }
    },
    CheckedChange(item, fileitem) {
      if (fileitem) {
        if (fileitem.checked) {
          item.checkedAll = false;
          item.isIndeterminate = true;
          if (item.fileList.every((file) => file.checked === true)) {
            item.checkedAll = true;
            item.isIndeterminate = false;
          }
        } else {
          const allUnchecked = item.fileList.every(
            (file) => file.checked === false
          );
          if (allUnchecked) {
            item.checkedAll = false;
            item.isIndeterminate = false;
          } else {
            const allChecked = item.fileList.every(
              (file) => file.checked === true
            );
            if (allChecked) {
              item.checkedAll = true;
              item.isIndeterminate = false;
            } else {
              item.checkedAll = false;
              item.isIndeterminate = true;
            }
          }
        }
      } else {
        item.isIndeterminate = false;
        item.fileList.forEach((fileitem) => {
          fileitem.checked = item.checkedAll;
        });
      }
      this.deletefiles = [];
      this.attachments.forEach((item) => {
        item.fileList.forEach((fileitem) => {
          if (fileitem.checked) {
            this.deletefiles.push(fileitem.guid);
          }
        });
      });
    },
    async EnforceFileDelete(item) {
      this.checkedItem = item;
      this.$confirm("此操作将永久删除选中的文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const loading = this.$loading({
            lock: true,
            text: "删除中...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          const res = await EnforceFileDelete(this.deletefiles);
          loading.close();
          if (res.code === 200) {
            item.checkedAll = false;
            item.isIndeterminate = false;
            this.$message.success("删除成功");
            this.getFileList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style scoped>
.attachment-list-container {
  padding: 20px 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}
.group-header {
  cursor: pointer;
  /* font-weight: bold; */
  background: linear-gradient(90deg, #e0e7ff 0%, #f5f7fa 100%);
  border-radius: 10px;
  padding: 5px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s, box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(80, 120, 255, 0.06);
  position: relative;
}
.group-header:hover {
  background: linear-gradient(90deg, #dbeafe 0%, #e0e7ff 100%);
  box-shadow: 0 4px 16px rgba(80, 120, 255, 0.1);
}
.group-header-actions {
  display: flex;
  align-items: center;
  /* margin-left: 10px; */
}
.group-header-operate {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 0 10px;
  margin-right: 10px;
}
.upload-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  /* background: #fff; */
  border-radius: 50%;
  /* box-shadow: 0 1px 4px rgba(80, 120, 255, 0.1); */
  padding: 6px;
  /* transition: background 0.2s, box-shadow 0.2s; */
  /* margin-right: 8px; */
  display: flex;
  align-items: center;
  gap: 0 5px;
}
.upload-btn span {
  color: rgb(102, 177, 255);
  font-size: 14px;
}
.el-icon-upload2 {
  color: rgb(102, 177, 255);
}
.upload-btn:hover {
  /* background: #e0e7ff; */
  /* box-shadow: 0 2px 8px rgba(80, 120, 255, 0.18); */
}
.upload-input {
  display: none;
}
.upload-icon {
  width: 22px;
  height: 22px;
  display: block;
}
.group-header .title {
  display: inline-block;
  width: 200px;
}
.attachment-group {
  margin-bottom: 20px;
}

.attachment-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px 20px; /* 行间距24px，列间距24px */
  padding: 12px 0 0 8px;
}

.attachment-item {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 12px 16px;
  transition: box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}
.attachment-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.filecheck {
  position: absolute;
  right: 10px;
  top: 10px;
}

.icon {
  font-size: 36px;
  margin-bottom: 10px;
  color: #1890ff;
}
.filename {
  width: 100px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.icon-image {
  width: 36px;
  height: 36px;
  margin-bottom: 10px;
  object-fit: contain;
}

.filename-text {
  display: inline-block;
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.upload-demo {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.nullfile {
  position: absolute;
  left: 50%;
  color: #ccc;
  transform: translateX(-50%);
}
.el-icon-arrow-right {
}
::v-deep .el-upload-list {
  max-height: 200px !important;
  overflow-y: auto !important;
}
</style>
