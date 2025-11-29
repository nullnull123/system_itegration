<template>
  <div class="ppt-to-video-container">
    <h2>PPT转视频测试</h2>
    <form @submit.prevent="convertVideo">

      <!-- PDF 文件上传 -->
      <div class="form-group">
        <label>PDF文件（必填）</label>
        <div
          class="upload-area"
          @click="triggerFileInput('pdf')"
          @drop="handleDrop($event, 'pdf')"
          @dragover.prevent
          @dragenter.prevent="setDragOver('pdf')"
          @dragleave.prevent="removeDragOver('pdf')"
          :class="{ 'dragover': dragOver.pdf }"
        >
          <div v-if="!form.pdf">
            <i>📄</i>
            <p>点击选择或拖拽PDF文件到此区域</p>
          </div>
          <div v-else class="file-info">
            <strong>已选择:</strong> {{ form.pdf.name }}
          </div>
        </div>
        <input
          type="file"
          ref="pdfInput"
          @change="handleFileSelect($event, 'pdf')"
          accept=".pdf"
          style="display: none;"
        />
      </div>

      <!-- 知识库文件上传 -->
      <div class="form-group">
        <label>知识库文件（可选）</label>
        <div
          class="upload-area"
          @click="triggerFileInput('know')"
          @drop="handleDrop($event, 'know')"
          @dragover.prevent
          @dragenter.prevent="setDragOver('know')"
          @dragleave.prevent="removeDragOver('know')"
          :class="{ 'dragover': dragOver.know }"
        >
          <div v-if="!form.know">
            <i>📚</i>
            <p>点击选择或拖拽知识库文件到此区域</p>
            <small>支持.txt/.doc/.docx文件</small>
          </div>
          <div v-else class="file-info">
            <strong>已选择:</strong> {{ form.know.name }}
          </div>
        </div>
        <input
          type="file"
          ref="knowInput"
          @change="handleFileSelect($event, 'know')"
          accept=".txt,.doc,.docx"
          style="display: none;"
        />
      </div>

      <!-- 视频下载/预览 & 日志 -->
      <div class="form-group" v-if="result.status">
        <label>输出/日志</label>

        <!-- 视频按钮 -->
        <div v-if="result.video_url" class="video-buttons">
          <button type="button" class="download-btn" @click="downloadVideo">下载视频</button>
          <button type="button" class="preview-btn" @click="openVideo">预览视频</button>
        </div>

        <!-- 日志链接 -->
        <div v-if="result.task_id" style="margin-top:10px;">
          <strong>日志文件:</strong>
          <a href="#" @click.prevent="viewLog" class="log-link">查看日志</a>
        </div>
      </div>

      <button
        type="submit"
        class="convert-btn"
        :disabled="converting || !form.pdf"
      >
        {{ converting ? '转换中...' : '开始转换' }}
      </button>
    </form>

    <div id="result" class="result" :class="result.status">
      <div v-if="converting">
        🔄 转换中，请稍候...
      </div>
      <div v-else-if="result.message">
        {{ result.message }}
      </div>
      <div v-else>
        请选择PDF文件开始转换
      </div>
    </div>
  </div>
</template>

<script>
import {PPT2VIDEO_URL} from '../api/request.js';

export default {
  name: 'PptToVideo',
  data() {
    return {
      form: { pdf: null, know: null },
      dragOver: { pdf: false, know: false },
      converting: false,
      result: {}
    };
  },
  methods: {
    triggerFileInput(field) {
      this.$refs[field + 'Input'].click();
    },
    handleFileSelect(event, field) {
      const file = event.target.files[0];
      if (file) this.form[field] = file;
    },
    handleDrop(event, field) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) this.form[field] = files[0];
    },
    setDragOver(field) {
      this.dragOver[field] = true;
    },
    removeDragOver(field) {
      this.dragOver[field] = false;
    },

    async convertVideo() {
      if (!this.form.pdf) {
        this.showResult('error', '请选择PDF文件');
        return;
      }
      this.converting = true;

      try {
        const fd = new FormData();
        fd.append('pdf', this.form.pdf);
        if (this.form.know) fd.append('know', this.form.know);

        const resp = await fetch('api'+PPT2VIDEO_URL+'/convert/', {
          method: 'POST',
          body: fd
        });
        const data = await resp.json();

        const pdf_base = this.form.pdf.name.replace(/\.[^/.]+$/, "");

        this.result = {
          status: data.status,
          task_id: data.task_id,
          message: data.status === 'success' ? '转换成功！' : (data.message || '转换失败')
        };

        if (data.status === 'success') {
          this.result.video_url = 'api'+PPT2VIDEO_URL+`/preview/video/?task_id=${data.task_id}&pdf_name=${pdf_base}`;
          this.result.download_url = 'api'+PPT2VIDEO_URL+`/download/video/?task_id=${data.task_id}&pdf_name=${pdf_base}`;
        }
      } catch (e) {
        this.showResult('error', `请求错误: ${e.message}`);
      }
      this.converting = false;
    },

    downloadVideo() {
      if (this.result.download_url) window.open(this.result.download_url);
    },
    openVideo() {
      if (this.result.video_url) window.open(this.result.video_url);
    },

    async viewLog() {
      if (!this.result.task_id) return;
      try {
        const resp = await fetch('api'+PPT2VIDEO_URL+`/log/?task_id=${this.result.task_id}`);
        if (!resp.ok) throw new Error('日志请求失败');
        const text = await resp.text();
        const logWindow = window.open('', '_blank');
        logWindow.document.write('<pre>' + text.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>');
        logWindow.document.title = '转换日志';
      } catch (e) {
        alert('获取日志失败: ' + e.message);
      }
    },

    showResult(status, message) {
      this.result = { status, message };
    }
  }
};
</script>

<style scoped>
.ppt-to-video-container {
  font-family: Arial;
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.form-group {
  margin: 20px 0;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9f9f9;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-area i {
  font-size: 48px;
  color: #007bff;
  margin-bottom: 10px;
}

.file-info {
  margin-top: 10px;
  padding: 8px;
  background: #e9ecef;
  border-radius: 4px;
  word-break: break-all;
}

button {
  padding: 12px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  color: white;
}

button:hover {
  opacity: 0.9;
}

button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.convert-btn {
  background: #007bff;
  width: 100%;
  margin-top: 10px;
}

.download-btn {
  background: #28a745;
}

.preview-btn {
  background: #17a2b8;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  white-space: pre-wrap;
  background: #f8f9fa;
}

.video-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.video-buttons button {
  flex: 1;
}

.error {
  color: #dc3545;
}

.success {
  color: #28a745;
}

.log-link {
  color: #007bff;
  text-decoration: underline;
}
</style>