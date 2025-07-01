<template>
  <div class="editor-container">
    <quill-editor
      class="editor"
      v-model="content"
      ref="myQuillEditor"
      :options="editorOption"
      @ready="onEditorReady"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @change="onEditorChange($event)"
    >
    </quill-editor>
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'

export default {
  name: "Editor",
  components: {
    quillEditor
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      content: this.value,
      editorOption: {
        placeholder: '请输入内容...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['image', 'video']
          ]
        }
      }
    }
  },
  watch: {
    value(newVal) {
      if (this.content !== newVal) {
        this.content = newVal
      }
    },
    content(newVal) {
      this.$emit('input', newVal)
    }
  },
  mounted() {
    // 在组件挂载后设置焦点
    this.$nextTick(() => {
      this.setEditorFocus()
    })
  },
  methods: {
    onEditorReady(editor) {
      // 编辑器准备就绪后设置焦点
      this.setEditorFocus()
    },
    setEditorFocus() {
      // 获取编辑器实例并设置焦点
      const editor = this.$refs.myQuillEditor.quill
      if (editor) {
        editor.focus()
      }
    },
    onEditorBlur(editor) {
      this.$emit('blur', editor)
    },
    onEditorFocus(editor) {
      this.$emit('focus', editor)
    },
    onEditorChange({ editor, html, text }) {
      this.$emit('change', { editor, html, text })
    }
  }
}
</script>

<style lang="scss">
.editor-container {
  width: 100%;
  margin: 0 auto;
  
  .editor {
    height: 400px;
    background: #fff;
    
    .ql-container {
      height: calc(100% - 42px);
      font-size: 14px;
      line-height: 1.6;
      
      .ql-editor {
        min-height: 300px;
        padding: 12px 15px;
        
        &:focus {
          outline: none;
        }
        
        &.ql-blank::before {
          font-style: normal;
          color: #909399;
        }
      }
    }
    
    .ql-toolbar {
      padding: 8px 15px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background-color: #fafafa;
      border-bottom: 1px solid #DCDFE6;
    }
  }
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}

.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}

.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}

.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}

.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}

.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}

.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
</style>