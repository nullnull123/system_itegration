<template>
    <div class="container mb-2" style="padding: 15px">
        <div class="alert rounded-0" role="alert" style="margin-bottom: 3px">
            <p class="mb-0 custom-text">用自己的声音或使用任意音色录制一段音频</p>
            <p class="mb-0 custom-text">用于克隆的最佳音频素材时长为 30s-120s, 为确保清晰准确的人声不要有杂音、背景音</p>
        </div>

        <div class="my-2 btn-group" style="margin-bottom: 10px !important">
            <button @click="toggle($event, 'tts')" class="btn border btn-primary">文字 → 语音</button>
        </div>
        <span class="question-mark" @click="showGuide" title="操作指南">
            <i class="fas fa-question-circle"></i>
        </span>

        <div class="p-3 shadow bg-white">
            <div class="btn-group overflow-auto w-100 p-1" style="white-space: nowrap"></div>
            <div>
                <div class="row mb-3 d-flex justify-content-center align-items-center gap-md-4">
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <label for="model" class="form-label w-auto" style="margin-bottom: 0px;">使用模型：</label>
                            <select class="form-select w-auto" name="model" id="model">
                                <option value="default">默认</option>
                            </select>
                        </div>
                        <div class="d-flex align-items-center mt-3">
                            <label for="language" class="form-label w-auto" style="margin-bottom: 0px;">文本语言：</label>
                            <select v-model="language" class="form-select w-auto" id="language">
                                <option v-for="item in languageList" :key="item.language_code"
                                    :value="item.language_code">
                                    {{ item.language_name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="col-md-3" style="margin-right: 30px; padding-left: 0px">
                        <label class="form-label">
                            要使用的声音文件:
                            <a href="javascript:;" class="form-text" @click="playSelectedVoice">点击试听</a>
                        </label>
                        <audio ref="ttsPreviewAudio" class="d-none" preload="none"></audio>
                        <el-select v-model="voiceFile" filterable placeholder="选择声音文件" class="form-select-compat"
                            popper-class="form-select-popper" style="width:105%;">
                            <el-option v-for="opt in voiceOptions" :key="opt.name" :label="opt.name" :value="opt.name">
                                <div class="d-flex align-items-center justify-content-between"
                                    style="gap:8px;width:100%;">
                                    <span>{{ opt.name }}</span>
                                    <button v-if="opt.deletable" class="option-remove"
                                        :disabled="deletingName === opt.name" @click.stop="handleDeleteVoice(opt)"
                                        title="删除该音色">×</button>
                                </div>
                            </el-option>
                        </el-select>
                        <div class="form-text" style="width: 260px">
                            <label class="btn btn-sm btn-secondary btn-file d-inline-block position-relative">
                                <span>从本地上传</span>
                                <input type="file" accept=".wav,.mp3,.flac,.webm"
                                    class="position-absolute start-0 top-0 end-0 bottom-0 opacity-0"
                                    @change="uploadFromLocal($event)" />
                            </label>
                            或在线录制30s的音频,即可在此选择使用
                        </div>
                    </div>

                    <div class="col-md-3 d-flex flex-column align-items-center justify-content-between"
                        style="height: 100px">
                        <div class="d-flex flex-row justify-content-between w-100 mb-1">
                            <button class="btn btn-sm btn-primary btn-record" @click="startRecording"
                                :disabled="isRecording">开始录制</button>
                            <button class="btn btn-sm btn-danger btn-record" @click="stopRecording"
                                :disabled="!isRecording">停止录制</button>
                            <button class="btn btn-sm btn-success btn-record" @click="uploadRecording"
                                :disabled="!recorded || !recordedBlob">使用该录音</button>
                        </div>
                        <audio :src="audioURL" style="width: 280px" class="w-10" controls></audio>
                    </div>
                </div>

                <!-- 上传 TXT 文件区域 -->
                <div class="mt-4">
                    <strong class="text-primary d-flex justify-content-between align-items-center">
                        <span class="form-label" style="margin-bottom: 0px;">上传要合成的 TXT 文本文件（可多选）</span>
                        <!-- 已有文件时显示“清空全部” -->
                        <a v-if="uploadedTxtFiles.length" href="javascript:void(0)" class="text-danger"
                            @click="clearAllTxt">清空全部</a>
                    </strong>

                    <input type="file" class="form-control" style="line-height: 2;" multiple accept=".txt"
                        @change="handleTxtUpload" />
                    <small class="form-text text-muted">
                        上传的文件将保存在服务器临时目录中，请确认内容无误。
                    </small>

                    <!-- 文件名列表 -->
                    <ul v-if="uploadedTxtFiles.length" class="list-group mt-2 w-25">
                        <li v-for="(file, idx) in uploadedTxtFiles" :key="file + '_' + idx"
                            class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-truncate d-inline-block w-75">{{ file }}</span>
                            <button type="button" class="btn btn-sm btn-outline-danger" title="移除该文件"
                                @click="removeTxt(file)">
                                <i class="fa fa-trash"></i>
                            </button>
                        </li>
                    </ul>

                    <!-- 总数 -->
                    <div v-if="uploadedTxtFiles.length" class="text-success mt-2">
                        共上传 {{ uploadedTxtFiles.length }} 个文件
                    </div>
                </div>

                <!-- 下载按钮 -->
                <button class="btn btn-success mt-3" @click="downloadAll" :disabled="!zipReady"
                    :title="zipReady ? '点击下载全部音频' : '音频还在生成中，不能下载'">
                    下载全部音频（ZIP）
                </button>

                <div class="row mt-4">
                    <div class="col-md-12 text-center position-relative mb-2">
                        <button ref="start_button" @click="start"
                            class="btn btn-danger btn-start-record">立即开始生成</button>
                    </div>
                    <div class="col-md-12 text-info text-center" v-if="isProcessing">
                        <i class="fa fa-spinner fa-spin me-1"></i> {{ tips || '正在合成音频，请稍候...' }}
                    </div>
                    <!-- <div style="max-height: 300px" class="col-md-12 overflow-auto d-none alert alert-primary"
                        ref="result_text">
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const MEDIA_BASE = 'http://10.104.52.24:8000/media';   // 统一的媒体前缀
import {
    getLanguageList,
    getVoiceListExt,
    deleteVoice,
    uploadAudioFile,
    runBatchTTS,
    getBatchProgress,
    uploadTxtFiles,
    deleteTxtFile,
    deleteTxtFiles,
    downloadZip,
} from '@/voiceclone/api/tts'

export default {
    data() {
        return {
            langlist: {
                lang1: '必须选择要试听的声音',
                lang2: '录制中',
                lang3: '停止录制后,可使用此按钮',
                lang4: '已录制',
                lang5: '开始录制',
                lang6: '停止录制后,可使用此按钮',
                lang7: '请选择要上传的文件',
                lang10: '必须选择要使用的声音',
                lang13: '开始合成，用时可能较久，耐心等待',
                lang15: '已转为wav格式: '
            },
            // ===== 基本模式 =====
            mode: 'tts',                     // 当前工作模式

            // ===== 语言 =====
            language: '',                    // 当前选中的语言代码，如 'zh-cn'
            languageList: [],                // [{ language_code, language_name }]

            // ===== 音色与文件 =====
            voiceFile: '',                   // 选中的音色文件名
            voiceOptions: [],                // 可用音色列表：[{ name, deletable }]
            deletingName: '',                // 正在删除的音色名，控制“×”按钮禁用
            ttsPreviewUrl: '',               // 试听音频的 src（带时间戳防缓存）

            // ===== 录音相关 =====
            isRecording: false,              // 是否正在录音（控制“开始/停止”按钮）
            recorded: false,                 // 是否已有一段录音可上传
            recordedBlob: null,              // 录音得到的 Blob（二进制数据）
            audioURL: '',                    // 录音生成后的 audio blob 地址

            // 内部录音资源
            mediaRecorder: null,             // MediaRecorder 实例
            recStream: null,                 // 麦克风音轨流
            audioChunks: [],                 // 录音分片缓冲
            recTimer: null,                  // 录音计时器
            sec: 0,                          // 录音秒数

            // ===== 轮询与任务 =====
            progressTimer: null,             // 进度轮询的定时器
            tips: '',                        // 页面提示文案
            uploadedTxtFiles: [],            // 已上传的 TXT 文件名列表
            isProcessing: false,             // 是否正在合成（控制“合成中”提示）
            zipReady: false,                 // ZIP 是否生成完成（控制“下载”按钮）
            zipUrl: '',                      // ZIP 下载链接

            // ===== 用户与批次 =====
            batchId: null,                   // 当前批次ID
            batchState: 'idle',              // idle|uploading|running|ready|closed
            fileOrderMap: {},                // { filename: 序号 } 由本批次上传顺序生成
            lastFileIdx: -1,                 // 上一次已经显示到的“文件序号”                     
            user_id: 'test_user_001',        // 默认测试用户 ID（上线时改为真实 session）
        }
    },
    mounted() {
        // 初始化下拉
        this.initLanguageList();
        this.initAudioList();

        this.getSessionUser();  // 获取用户 session ID（预留）

        // 刷新/关闭页面前：停止试听，释放资源
        this._onBeforeUnload = this.stopTtsPreview.bind(this);
        window.addEventListener('beforeunload', this._onBeforeUnload);

        // 标签页隐藏时：停止试听，避免后台误播
        this._onVisibilityChange = () => {
            if (document.hidden) this.stopTtsPreview();
        };
        document.addEventListener('visibilitychange', this._onVisibilityChange);
    },
    beforeDestroy() {
        // 离开组件时，停止播放并清理监听
        this.stopTtsPreview();

        if (this._onBeforeUnload) {
            window.removeEventListener('beforeunload', this._onBeforeUnload);
            this._onBeforeUnload = null;
        }
        if (this._onVisibilityChange) {
            document.removeEventListener('visibilitychange', this._onVisibilityChange);
            this._onVisibilityChange = null;
        }

        // 清掉轮询与录音的计时器，保证不漏
        if (this.progressTimer) { clearInterval(this.progressTimer); this.progressTimer = null; }
        if (this.recTimer) { clearInterval(this.recTimer); this.recTimer = null; }
    },

    methods: {
        toggle(type) {
            this.mode = type;
        },
        showGuide() {
            this.$alert(
                '<div style="text-align:center;"><img src="/static/images/guide3.png" style="max-width:110%;"></div>',
                '操作指南',
                { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
            );
        },
        // 获取语言列表  拉取语言 → 填充 languageList → 默认选中 zh-cn 或第一项
        async initLanguageList() {
            try {
                const res = await getLanguageList();
                const langs = (res && res.data && Array.isArray(res.data.languages))
                    ? res.data.languages
                    : [];

                this.languageList = langs;

                // 默认选中：优先 zh-cn，没有则取第一项
                if (!this.language && langs.length) {
                    const zh = langs.find(function (x) { return x.language_code === 'zh-cn'; });
                    this.language = zh ? zh.language_code : langs[0].language_code;
                }
            } catch (e) {
                console.error('[initLanguageList] 失败：', e);
                this.languageList = [];
                if (this.$message) this.$message.error('获取语言列表失败');
            }
        },

        // 获取音色列表  拉取音色 → 规范化为 {name,deletable} → 保持/回退当前选择 voiceFile
        async initAudioList() {
            try {
                // 加时间戳，避免删/传之后命中缓存
                const res = await getVoiceListExt({ t: Date.now() });
                const voices = (res && res.data && Array.isArray(res.data.voices))
                    ? res.data.voices
                    : [];

                // 规范化
                this.voiceOptions = voices.map(function (v) {
                    return { name: v.name, deletable: !!v.deletable };
                });

                // 保持当前选择；若当前选择已不存在则回退到第一项
                var has = false;
                for (var i = 0; i < this.voiceOptions.length; i++) {
                    if (this.voiceOptions[i].name === this.voiceFile) { has = true; break; }
                }
                if (!has) {
                    this.voiceFile = this.voiceOptions.length ? this.voiceOptions[0].name : '';
                }
            } catch (e) {
                console.error('[initAudioList] 失败：', e);
                this.voiceOptions = [];
                if (this.$message) this.$message.error('获取音色失败');
            }
        },

        // 删除音色  确认 → 调 deleteVoice(name) → 刷新列表 → 修正选中项
        async handleDeleteVoice(item) {
            if (!item || !item.name) return;
            if (!item.deletable) {
                if (this.$message) this.$message.warning('该音色不允许删除');
                return;
            }

            try {
                await this.$confirm(
                    '确定要删除音色「' + item.name + '」吗？此操作不可撤销。',
                    '提示',
                    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
                );
            } catch (e) {
                return; // 用户取消
            }

            this.deletingName = item.name;
            try {
                const res = await deleteVoice(item.name);
                const data = (res && res.data) ? res.data : {};
                const code = (typeof data.code === 'number') ? data.code : -1;
                const msg = data.msg || '删除失败';

                if (code !== 0) throw new Error(msg);

                if (this.$message) this.$message.success('已删除');

                var deletedName = item.name;
                await this.initAudioList();

                // 若删的是当前选中的，回退到第一项
                if (this.voiceFile === deletedName) {
                    this.voiceFile = this.voiceOptions[0] ? this.voiceOptions[0].name : '';
                }
            } catch (err) {
                var em = (err && err.message) ? err.message : '请稍后重试';
                if (this.$message) this.$message.error('删除失败：' + em);
                console.error('[handleDeleteVoice] 删除失败：', err);
            } finally {
                this.deletingName = '';
            }
        },

        // 试听选中音色
        async playSelectedVoice() {
            // 必须先选一个音色文件
            if (!(typeof this.voiceFile === 'string' && this.voiceFile.length > 0)) {
                if (this.$alert) return this.$alert(this.langlist && this.langlist.lang1 ? this.langlist.lang1 : '请先选择一个声音文件', '提示');
                return;
            }

            var el = this.$refs.ttsPreviewAudio;
            if (!el) {
                if (this.$message) this.$message.error('播放器未就绪，请刷新页面后重试');
                return;
            }

            try {
                // 防缓存的可播放地址
                this.ttsPreviewUrl = MEDIA_BASE + '/voicelist/' + encodeURIComponent(this.voiceFile) + '?t=' + Date.now();

                // 播放前先停旧的、归零、换 src
                try { el.pause(); } catch (e) { }
                el.currentTime = 0;
                el.src = this.ttsPreviewUrl;

                // 事件处理
                var self = this;
                el.onended = function () { /* 播放结束，保持静默 */ };
                el.onerror = function () {
                    if (self.$message) self.$message.error('音频播放失败');
                };

                // 开始播放（支持 Promise 的浏览器）
                var p = el.play();
                if (p && typeof p.then === 'function') {
                    await p;
                }
            } catch (e) {
                if (this.$message) this.$message.error('音频播放失败');
                console.error('[TTS preview] play error:', e);
            }
        },

        // 停止试听（供离开页面/刷新时调用）
        stopTtsPreview() {
            var el = this.$refs.ttsPreviewAudio;
            if (el) {
                try { el.pause(); } catch (e) { }
                try { el.currentTime = 0; } catch (e) { }
            }
        },

        // 开始录音：申请麦克风 → MediaRecorder 录制 → 最长 120s → onstop 生成 recordedBlob & audioURL 预览
        startRecording() {
            var self = this;
            if (self.isRecording) return;

            // 清理上一次的资源（若有）
            self._clearRecorder();

            self.audioChunks = [];
            self.recorded = false;
            self.recordedBlob = null;
            self.audioURL = '';

            // 申请麦克风
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
                self.recStream = stream;

                // 选择一个通用的 mimeType
                var mime = '';
                if (window.MediaRecorder && typeof MediaRecorder.isTypeSupported === 'function') {
                    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                        mime = 'audio/webm;codecs=opus';
                    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                        mime = 'audio/webm';
                    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                        mime = 'audio/ogg;codecs=opus';
                    }
                }

                try {
                    self.mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
                } catch (e) {
                    // 某些环境构造器会抛错
                    self.mediaRecorder = new MediaRecorder(stream);
                }

                self.mediaRecorder.ondataavailable = function (event) {
                    if (event && event.data && event.data.size > 0) {
                        self.audioChunks.push(event.data);
                    }
                };

                self.mediaRecorder.onstop = function () {
                    // 合并为 Blob
                    var outType = (self.mediaRecorder && self.mediaRecorder.mimeType) ? self.mediaRecorder.mimeType : 'audio/webm';
                    try {
                        self.recordedBlob = new Blob(self.audioChunks, { type: outType });
                    } catch (e) {
                        self.recordedBlob = new Blob(self.audioChunks);
                    }
                    self.audioURL = self.recordedBlob ? URL.createObjectURL(self.recordedBlob) : '';
                    self.audioChunks = [];

                    // 释放麦克风
                    if (self.recStream && self.recStream.getTracks) {
                        try { self.recStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { }
                    }
                    self.recStream = null;
                    self.mediaRecorder = null;

                    self.isRecording = false;
                    self.recorded = !!self.recordedBlob;
                };

                // 真正开始录音
                self.mediaRecorder.start();
                self.isRecording = true;
                self.sec = 0;

                // 计时器
                if (self.recTimer) {
                    clearInterval(self.recTimer);
                    self.recTimer = null;
                }
                self.recTimer = setInterval(function () {
                    self.sec += 1;
                    if (self.sec >= 120) {
                        self.stopRecording(); // 到 120s 自动停止
                    }
                }, 1000);

            }).catch(function (err) {
                self.isRecording = false;
                if (self.$message) self.$message.error('无法访问麦克风：' + (err && err.message ? err.message : '请检查权限'));
            });
        },

        // 停止录音：停计时 → 停止 MediaRecorder（触发 onstop）→ 若已不在录制状态则手动停流
        stopRecording() {
            var self = this;

            // 停计时
            if (self.recTimer) {
                clearInterval(self.recTimer);
                self.recTimer = null;
            }
            self.sec = 0;

            // 停止 MediaRecorder（会触发 onstop 合并 blob）
            if (self.mediaRecorder && self.mediaRecorder.state !== 'inactive') {
                try { self.mediaRecorder.stop(); } catch (e) { }
            } else {
                // 如果 recorder 已经不在“recording”状态，仍需清理流
                if (self.recStream && self.recStream.getTracks) {
                    try { self.recStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { }
                }
                self.recStream = null;
                self.mediaRecorder = null;
                self.isRecording = false;
            }
        },

        // 清理录音资源：停计时、停 MediaRecorder、停轨道、清空缓存
        _clearRecorder() {
            var self = this;
            if (self.recTimer) {
                clearInterval(self.recTimer);
                self.recTimer = null;
            }
            if (self.mediaRecorder && self.mediaRecorder.state !== 'inactive') {
                try { self.mediaRecorder.stop(); } catch (e) { }
            }
            if (self.recStream && self.recStream.getTracks) {
                try { self.recStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { }
            }
            self.mediaRecorder = null;
            self.recStream = null;
            self.audioChunks = [];
            self.sec = 0;
        },

        //  工具：清理用户输入文件名（不含后缀）
        _sanitizeStem(input) {
            var stem = (input || '').trim();
            if (!stem) stem = 'record';
            // 仅保留中英文、数字、下划线、点、连字符，其余替换为下划线
            stem = stem.replace(/[^0-9A-Za-z\u4e00-\u9fff._-]+/g, '_')
                .replace(/^[._-]+|[._-]+$/g, '');
            if (!stem) stem = 'record';
            if (stem.length > 80) stem = stem.slice(0, 80);
            return stem;
        },

        //  上传录音为音色：弹框命名 → 清洗 → FormData(Blob, name.wav) → uploadAudioFile → 刷新音色
        async uploadRecording() {
            if (!this.recordedBlob) {
                return this.$alert((this.langlist && this.langlist.lang6) || '请先录音', '提示');
            }

            // 1) 让用户输入期望的文件名
            var promptRes = null;
            try {
                promptRes = await this.$prompt(
                    '请输入录音文件名（可不写 .wav，保存时会自动加上）',
                    '命名录音',
                    {
                        inputPlaceholder: '例如：李老师_课件_音色 或 李老师_课件_音色.wav',
                        confirmButtonText: '保存',
                        cancelButtonText: '取消',
                        inputPattern: /.+/,
                        inputErrorMessage: '文件名不能为空'
                    }
                );
            } catch (e) {
                promptRes = { action: 'cancel' };
            }

            var value = promptRes && promptRes.value;
            var action = promptRes && promptRes.action;
            if (action === 'cancel') return;

            // 2) 规范化：去掉扩展名，清理非法字符，长度限制
            var raw = (value || '').trim();
            raw = raw.replace(/\.[A-Za-z0-9]+$/i, '');
            var stem = this._sanitizeStem(raw);

            // 3) 组装 FormData，并使用“用户命名 + .wav”作为第三个参数传给后端
            var fd = new FormData();
            fd.append('audio', this.recordedBlob, stem + '.wav');

            // 4) 调后端上传接口
            var resp = await uploadAudioFile(fd);
            var data = resp && resp.data ? resp.data : {};

            if (data.code === 0) {
                if (this.$message) this.$message.success('录音上传成功：' + data.data);
                this.voiceFile = data.data;     // 选中新上传的音色
                this.recorded = false;          // 重置录音态
                await this.initAudioList();     // 刷新音色下拉
            } else {
                if (this.$message) this.$message.error(data.msg || '上传失败');
            }
        },

        //  从本地选择并上传为音色：FormData(file) → uploadAudioFile → 刷新音色；最后清空 <input> value
        async uploadFromLocal(e) {
            var file = e && e.target ? e.target.files[0] : null;
            if (!file) {
                if (this.$alert) this.$alert(this.langlist && this.langlist.lang7 ? this.langlist.lang7 : '请选择一个音频文件', '提示');
                return;
            }

            var fd = new FormData();
            fd.append('audio', file);      // 默认进 voicelist 目录
            try {
                var resp = await uploadAudioFile(fd);
                var data = resp && resp.data ? resp.data : {};
                if (data.code === 0) {
                    if (this.$message) this.$message.success('上传成功');
                    this.voiceFile = data.data;   // 选中新上传的音色
                    await this.initAudioList();   // 刷新音色下拉
                } else {
                    if (this.$message) this.$message.error(data.msg || '上传失败');
                }
            } catch (err) {
                if (this.$message) this.$message.error('上传失败，请稍后重试');
            } finally {
                // 允许重复选择同一个文件（必须清空 input 值）
                if (e && e.target) {
                    try { e.target.value = ''; } catch (x) { }
                }
            }
        },

        // 生成批次ID（时间戳 + 随机）
        _genBatchId() {
            var t = Date.now().toString(36);
            var r = Math.random().toString(36).slice(2, 8);
            return t + '_' + r;
        },

        // 按需创建批次（当前为 closed/ready/空时重开）
        _ensureOpenBatch() {
            if (!this.batchId || this.batchState === 'closed' || this.batchState === 'ready') {
                this.batchId = this._genBatchId();
                this.uploadedTxtFiles = [];
                this.zipReady = false;
                this.zipUrl = '';
                this.batchState = 'idle';
            }
        },

        //  处理 TXT 批量文件上传（支持多选 + 多次追加，同名只在“当前批次”里判断）
        handleTxtUpload(e) {
            this._ensureOpenBatch();     // 首次上传或前一批已封盘时，自动开新批次
            this.batchState = 'uploading';    //  标记状态为正在上传

            // 1) 获取本次选择的文件列表
            var files = e.target.files;
            if (!files || files.length === 0) {
                if (this.$message) {
                    this.$message.warning("请选择要上传的 TXT 文件");
                }
                return;
            }

            // 2) 本地同名检测：仅和“当前批次”列表 this.uploadedTxtFiles 对比
            var existed = {};       // { filename: true }
            for (var i = 0; i < this.uploadedTxtFiles.length; i++) {
                existed[this.uploadedTxtFiles[i]] = true;
            }

            var toUpload = [];     // 本次真正要上传的文件
            var duplicated = [];   // 本次选择里，与“当前批次”重名的文件名

            for (var j = 0; j < files.length; j++) {
                var name = files[j].name;
                if (existed[name]) {
                    duplicated.push(name);
                } else {
                    toUpload.push(files[j]);
                }
            }

            // 3) 若均为重名，直接提示并退出
            if (toUpload.length === 0) {
                if (this.$message) this.$message.info("已存在同名文件：" + duplicated.join("、") + ",请更名后再上传");
                e.target.value = '';   // 清空 input，保证下次能触发 change
                return;
            }

            // 4) 打包“非重名”的文件上传
            var formData = new FormData();
            for (var k = 0; k < toUpload.length; k++) {
                formData.append('files', toUpload[k]);
            }
            formData.append('user_id', this.user_id || 'guest');
            formData.append('batch_id', this.batchId);

            // 5) 调用上传接口
            uploadTxtFiles(formData)
                .then(({ data }) => {
                    if (data.code === 0) {
                        // 本次保存成功的文件名
                        var incoming = Array.isArray(data.filenames) ? data.filenames : [];

                        // 合并已有的文件列表和本次新增的文件
                        var merged = this.uploadedTxtFiles.slice();
                        for (var m = 0; m < incoming.length; m++) {
                            var nm = incoming[m];
                            // 如果旧列表里没有这个文件名，就加进去
                            if (merged.indexOf(nm) === -1) merged.push(nm);
                        }
                        this.uploadedTxtFiles = merged;

                        var tip = "上传成功 " + incoming.length + " 个";
                        if (duplicated.length > 0) {
                            tip += "；本批次已存在同名，已跳过：" + duplicated.join("、");
                        }
                        // 若后端也返回了 skipped
                        var skipped = Array.isArray(data.skipped) ? data.skipped : [];
                        if (skipped.length > 0) {
                            tip += "；服务器跳过：" + skipped.join("、");
                        }
                        if (this.$message) this.$message.success(tip);
                    } else {
                        if (this.$message) this.$message.error(data.msg || "TXT 文件上传失败");
                    }
                })
                .catch(() => {
                    if (this.$message) this.$message.error("TXT 文件上传失败，请检查网络连接");
                })
                .finally(function () {
                    e.target.value = '';  // 清空 input 值
                });
        },

        //  从待合成列表里移除一个文件名
        removeTxt(name) {
            if (!Array.isArray(this.uploadedTxtFiles) || !this.uploadedTxtFiles.length) return;

            // 先从前端列表移除
            var next = [];
            for (var i = 0; i < this.uploadedTxtFiles.length; i++) {
                if (this.uploadedTxtFiles[i] !== name) next.push(this.uploadedTxtFiles[i]);
            }
            this.uploadedTxtFiles = next;

            //  同步删除服务器临时文件
            deleteTxtFile({ filename: name, user_id: this.user_id, batch_id: this.batchId }).catch(() => {
                this.$message && this.$message.warning('本地列表已移除，但服务器临时文件未删除');
            });
        },

        // 一键清空待合成列表
        clearAllTxt() {
            // 备份当前列表
            var toDelete = this.uploadedTxtFiles.slice();

            // 先清空前端列表
            this.uploadedTxtFiles = [];

            // 再批量删除后端临时文件
            if (toDelete.length > 0) {
                deleteTxtFiles({ filenames: toDelete, user_id: this.user_id, batch_id: this.batchId }).catch(() => {
                    this.$message && this.$message.warning('已清空本地列表，但服务器临时文件未全部删除');
                });
            }
        },

        // 点击“立即开始生成” 
        start() {
            if (this.isProcessing) return;
            // 若已有轮询，先清掉，避免重复 setInterval
            if (this.progressTimer) { clearInterval(this.progressTimer); this.progressTimer = null; }

            // 若无批次或已封盘/已完成，则开新批次
            this._ensureOpenBatch();

            const voice = this.voiceFile;
            const lang = this.language;

            if (!voice) return this.$message.warning(this.langlist.lang10);
            if (!this.uploadedTxtFiles.length) return this.$message.warning('请上传TXT文件');

            // 根据本批次待处理列表，建立文件顺序映射；并重置“已显示到哪个文件”
            this.fileOrderMap = {};
            this.uploadedTxtFiles.forEach((nm, i) => { this.fileOrderMap[nm] = i; });
            this.lastFileIdx = -1;
            this.tips = '';

            // 重置状态
            this.isProcessing = true;
            this.zipReady = false;
            this.zipUrl = '';

            this.$message.info('已提交任务，正在生成音频...');

            runBatchTTS({
                voice,
                language: lang,
                filenames: this.uploadedTxtFiles,
                user_id: this.user_id,
                batch_id: this.batchId
            }).then(({ data }) => {
                if (data.code === 0) {
                    this.batchState = 'running';
                    this.pollProgressUntilZipReady();          // 自动轮询直到生成 ZIP
                } else {
                    this.$message.error('任务提交失败：' + (data.msg || ''));
                    this.isProcessing = false;
                }
            }).catch(() => {
                this.$message.error('任务提交失败，请检查网络连接');
                this.isProcessing = false;
            });
        },


        pollProgressUntilZipReady() {
            if (this.progressTimer) { clearInterval(this.progressTimer); this.progressTimer = null; }

            // 仅按“文件序号前进”来更新提示
            const maybeUpdateCurrentFile = (name) => {
                if (!name) return;
                const idx = Object.prototype.hasOwnProperty.call(this.fileOrderMap, name)
                    ? this.fileOrderMap[name]
                    : Number.POSITIVE_INFINITY;  // 不在映射里的排到最后
                if (idx > this.lastFileIdx) {
                    this.tips = '正在处理：' + name;   // 只显示文件名
                    this.lastFileIdx = idx;
                }
            };

            this.progressTimer = setInterval(() => {
                getBatchProgress(this.user_id, this.batchId).then(({ data }) => {
                    if (data && data.end && Array.isArray(data.filenames) && data.filenames.length > 0) {
                        // 批次结束：停止轮询 -> 触发打包 -> 设置 ready
                        clearInterval(this.progressTimer);
                        this.progressTimer = null;

                        downloadZip(data.filenames, this.user_id, this.batchId).then(({ data: dz }) => {
                            if (dz.code === 0) {
                                this.zipReady = true;
                                this.zipUrl = dz.file_url;
                                this.$message.success('音频已合成完成，可下载 ZIP');
                                this.batchState = 'ready';
                            } else {
                                this.$message.error('打包失败：' + (dz.msg || ''));
                            }
                            this.isProcessing = false;
                            this.tips = '';
                            this.lastFileIdx = -1;
                        }).catch(() => {
                            this.$message.error('音频打包失败，请检查服务器');
                            this.isProcessing = false;
                            this.tips = '';
                            this.lastFileIdx = -1;
                        });
                    } else if (data && data.name && !data.end) {
                        maybeUpdateCurrentFile(data.name);
                    }
                }).catch((err) => {
                    console.warn('轮询异常：', err);
                });
            }, 3000);
        },

        // 下载全部音频：zipReady & zipUrl 校验后 window.open(zipUrl)
        downloadAll() {
            if (!this.zipReady || !this.zipUrl) {
                this.$message.warning("音频尚未合成完成，无法下载");
                return;
            }

            window.open(this.zipUrl, '_blank');

            // 下载后封盘，下一次操作会自动新开批次
            this.batchState = 'closed';
        },





        //  预留接口，用于登录后自动获取 session 中的 user_id
        getSessionUser() {
            // 示例代码，请根据你后端实际路径改动
            // axios.get('/check_login/')
            //     .then(({ data }) => {
            //         if (data && data.user_id) {
            //             this.user_id = data.user_id;
            //         }
            //     });

            // 默认先使用测试 ID
            this.user_id = 'test_user_001';
        },
    }
}
</script>


<style scoped>
.custom-text {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.7px;
}

.question-mark {
    margin-left: 10px;
    padding-top: 2px;
    cursor: pointer;
    font-size: 20px;
    color: #007bff;
}

.question-mark:hover {
    color: #0056b3;
}

.form-label {
    font-size: 1.1rem;
    font-weight: bold;
    color: #0d6efd;
}

.form-control {
    border-radius: 0.25rem;
    margin-top: 0.5rem;
}

.form-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.5rem;
}

.form-select {
    height: calc(2.5rem + 2px);
}


/* Vue2 深度选择器：>>> 或 /deep/ 都可 */
.form-select-compat>>>.el-input .el-input__inner {
    height: 42px !important;
    line-height: 42px !important;
    font-size: 15px !important;
    color: #212529 !important;
    padding: .375rem .75rem;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    box-shadow: none;
}

/* 右侧箭头区域位置 */
.form-select-compat>>>.el-input__suffix {
    right: 10px;
}

/* 占位符颜色 */
.form-select-compat>>>.el-input__inner::placeholder {
    color: #6c757d;
}

/* 聚焦样式 */
.form-select-compat.is-focus>>>.el-input__inner,
.form-select-compat>>>.el-input__inner:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 .2rem rgba(0, 123, 255, .25);
}

/* 禁用态 */
.form-select-compat>>>.el-input.is-disabled .el-input__inner {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
}

/* 下拉项样式：黑色字体 + 右侧 × */
.form-select-popper .el-select-dropdown__item {
    display: flex;
    align-items: center;
    color: black;
    font-size: 14.5px;
}

.form-select-popper .el-select-dropdown__item.selected {
    color: #212529;
    font-weight: 400;
    background: none;
}

/* 右侧删除按钮：靠右、留出间距 */
.form-select-popper .option-remove {
    margin-left: auto;
    padding: 0;
    line-height: 1;
    color: #dc3545;
    background: transparent;
    border: none;
    cursor: pointer;
}

.form-select-popper .option-remove[disabled] {
    opacity: .5;
    cursor: not-allowed;
}
</style>
