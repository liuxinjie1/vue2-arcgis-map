<template>
  <div style="height: 100%; width: 100%">
    <component
      :is="previewComponent"
      v-if="previewComponent && previewComponent !== 'txt' && renderingstatus"
      :src="url"
      style="height: 100%; width: 100%"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
    <div
      v-else-if="previewComponent === 'txt' && renderingstatus"
      class="txt-preview"
    >
      <pre>{{ txtContent }}</pre>
    </div>
    <div v-else>文件加载预览失败</div>
  </div>
</template>

<script>
//引入VueOfficeDocx组件
import VueOfficeDocx from "@vue-office/docx";
//引入相关样式
import "@vue-office/docx/lib/index.css";
//引入VueOfficeExcel组件
import VueOfficeExcel from "@vue-office/excel";
//引入相关样式
import "@vue-office/excel/lib/index.css";
//引入VueOfficePdf组件
import VueOfficePdf from "@vue-office/pdf";
//引入VueOfficePptx组件
import VueOfficePptx from "@vue-office/pptx";

export default {
  name: "FilePreview",
  components: {
    VueOfficeDocx,
    VueOfficeExcel,
    VueOfficePdf,
    VueOfficePptx,
  },
  props: {
    url: {
      type: String,
      required: true,
      default: "",
    },
    type: {
      type: String,
      required: true,
      default: "",
    },
  },
  data() {
    return {
      loading: null,
      txtContent: "",
      renderingstatus: false,
    };
  },
  computed: {
    previewComponent() {
      const type = this.type.toLowerCase();
      if (type === "doc" || type === "docx") return "vue-office-docx";
      if (type === "xls" || type === "xlsx") return "vue-office-excel";
      if (type === "pdf") return "vue-office-pdf";
      if (type === "ppt" || type === "pptx") return "vue-office-pptx";
      if (
        type === "jpg" ||
        type === "jpeg" ||
        type === "png" ||
        type === "gif" ||
        type === "img"
      ) {
        return "img";
      }
      if (type === "txt") return "txt";
      return null;
    },
  },
  watch: {
    url: {
      immediate: true,
      handler(newUrl) {
        if (this.previewComponent === "txt" && newUrl) {
          this.loadTxtContent(newUrl);
        }
      },
    },
  },
  mounted() {
    this.renderingstatus = false;
  },
  methods: {
    async loadTxtContent(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("网络错误，状态码：" + response.status);
        }
        const text = await response.text();
        this.txtContent = text;
        this.renderingstatus = true;
      } catch (error) {
        this.renderingstatus = false;
        console.error("加载txt文件失败:", error);
        this.txtContent = "文件加载失败";
      }
    },
    renderedHandler(event) {
      console.log("渲染完成", event);
      this.renderingstatus = true;
      if (this.loading) {
        this.loading.close();
      }
    },
    errorHandler(event) {
      console.log("渲染失败", event);
      this.renderingstatus = false;
      this.$message.error("渲染失败：" + event);
      if (this.loading) {
        this.loading.close();
      }
    },
  },
};
</script>

<style scoped>
.txt-preview {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 20px;
  background: #fff;
}

.txt-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  margin: 0;
}
</style>
