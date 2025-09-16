<template>
    <div class="container mb-2" style="padding: 15px;">
        <div class="alert rounded-0">
            <p class="mb-0 custom-text">用自己的声音或使用任意音色录制一段音频</p>
            <p class="mb-0 custom-text">用于克隆的最佳音频素材时长为 30s-120s, 为确保清晰准确的人声不要有杂音、背景音</p>
        </div>

        <div class="my-2 btn-group">
            <button @click="toggle('tts')" :class="['btn border', mode === 'tts' ? 'btn-primary' : '']"
                style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">文本转语音</button>
            <button @click="toggle('sts')" :class="['btn border', mode === 'sts' ? 'btn-primary' : '']"
                style="border-top-right-radius: 8px; border-bottom-right-radius: 8px;">音色转换</button>
            <span class="question-mark" @click="showGuide(mode)" title="操作指南">
                <i class="fas fa-question-circle"></i>
            </span>
        </div>

        <div class="p-3 shadow bg-white">
            <div v-show="mode === 'tts'">
                <div class="mb-3 d-flex flex-wrap justify-content-between align-items-start">
                    <div style="flex: 0 0 22%; padding-right: 10px; min-width: 220px;">
                        <div class="d-flex align-items-center">
                            <label class="form-label w-auto" style="margin-bottom: 0px;">使用模型：</label>
                            <select v-model="model" @change="setVoice" class="form-select w-auto">
                                <option value="default">默认</option>
                                <option v-for="m in models" :key="m.name" :value="m.name">{{ m.label }}</option>
                            </select>
                        </div>
                        <div class="d-flex align-items-center mt-3">
                            <label class="form-label w-auto" style="margin-bottom: 0px;">文本语言：</label>
                            <select v-model="language" class="form-select w-auto">
                                <option v-for="lang in languageList" :key="lang.language_code"
                                    :value="lang.language_code">
                                    {{ lang.language_name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div style="flex: 0 0 22%; padding: 0px 10px; min-width: 200px;">
                        <label class="form-label">选择速度倍数(0.1-2.0):</label><br>
                        <span class="text-muted">(1.0为正常语速)</span>
                        <input v-model.number="speed" type="number" min="0.1" max="2.0" step="0.05"
                            class="form-control mt-2" style="width:80px;">
                    </div>

                    <div style="flex: 0 0 27%; padding-right: 45px; min-width: 250px;">
                        <label class="form-label">
                            要使用的声音文件:
                            <a href="javascript:;" class="form-text" @click="playSelectedVoice">点击试听</a>
                        </label>
                        <!-- TTS 专用播放器 -->
                        <audio ref="ttsPreviewAudio" class="d-none" preload="none"></audio>
                        <el-select v-model="voiceFile" filterable placeholder="选择声音文件" class="form-select-compat"
                            popper-class="form-select-popper" style="width:106%;">
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
                        <div class="form-text">
                            <label class="btn btn-sm btn-secondary btn-file">
                                从本地上传
                                <input type="file" @change="uploadFromLocal">
                            </label>
                            或在线录制30s的音频,即可在此选择使用
                        </div>
                    </div>

                    <div style="flex: 0 0 25%; min-width: 270px;"
                        class="d-flex flex-column align-items-center justify-content-between">
                        <div class="d-flex flex-row justify-content-between w-100 mb-3">
                            <button @click="startRecording" :disabled="isRecording"
                                class="btn btn-sm btn-primary">开始录制</button>
                            <button @click="stopRecording" :disabled="!isRecording"
                                class="btn btn-sm btn-danger">停止录制</button>
                            <button @click="uploadRecording" :disabled="!recorded"
                                class="btn btn-sm btn-success">使用该录音</button>
                        </div>
                        <audio style="width:280px" ref="audioPlayer" controls></audio>
                    </div>
                </div>
                <textarea v-model="textInput" class="form-control" rows="5" placeholder="在此输入要合成的文字"></textarea>
                <label class="btn-file  btn-secondary-srt mt-1">
                    <span class="btn btn-sm">导入文本文件(txt、srt)</span>
                    <input type="file" accept=".srt,.txt"
                        class="position-absolute start-0 top-0 end-0 bottom-0 opacity-0" @change="uploadSrtFile">
                </label>
                <div class="text-center mt-3">
                    <button @click="startSynthesis" class="btn btn-danger">立即开始生成</button>
                </div>
            </div>

            <div v-show="mode === 'sts'">
                <div class="p-2 d-flex align-items-center" style="gap:8px;">
                    <label class="form-label" style="margin-bottom: 0px;">要克隆的音色:</label>
                    <el-select v-model="stsVoice" filterable placeholder="选择声音文件" class="form-select-compat"
                        popper-class="form-select-popper" style="min-width: 260px; margin-left: 8px;">
                        <el-option v-for="opt in voiceOptions" :key="opt.name" :label="opt.name" :value="opt.name">
                            <div class="d-flex align-items-center justify-content-between" style="gap:8px;">
                                <span>{{ opt.name }}</span>
                                <button v-if="opt.deletable" class="option-remove" :disabled="deletingName === opt.name"
                                    @click.stop="handleDeleteVoice(opt)" title="删除该音色">×</button>
                            </div>
                        </el-option>
                    </el-select>
                    <!-- 试听链接 -->
                    <label class="form-label mb-0" style="margin-left: 4px; margin-top: 17px;">
                        <a href="javascript:;" class="form-text" @click="onStsPreview">
                            点击试听
                        </a>
                    </label>
                    <!-- STS 专用播放器 -->
                    <audio ref="stsPreviewAudio" class="d-none" preload="none"></audio>
                </div>
                <!-- 上传灰框：拖拽或点击 -->
                <div ref="dropZone" class="border m-2 p-5 text-center" style="cursor:pointer;"
                    @drop.prevent="handleFileUpload" @dragover.prevent @click="triggerFileInput">
                    {{ stsFileName ? '✅ 已上传：' + stsFileName : '拖拽或点击将音频 wav/mp3/flac 文件上传' }}
                </div>
                <!-- 隐藏 file input -->
                <input type="file" accept=".mp3,.wav,.flac" ref="stsFileInput" class="d-none"
                    @change="handleFileUpload">
                <div class="text-center mt-3">
                    <button @click="startSTS" class="btn btn-danger">立即开始转换</button>
                </div>
            </div>

            <div class="text-danger text-center my-2" v-if="warningMessage">{{ warningMessage }}</div>
            <div class="text-danger text-center my-2" v-if="tipsMessage">{{ tipsMessage }}</div>
            <div class="text-center my-4">
                <audio ref="resultAudio" controls class="d-none"></audio>
            </div>
        </div>
    </div>
</template>

<script>
const MEDIA_BASE = process.env.VUE_APP_BASE_API + '/media';   // 统一的媒体前缀
import {
    getLanguageList,
    getVoiceListExt,
    deleteVoice,
    getModelStatus,
    toggleModelStatus,
    uploadAudioFile,
    runTTS,
    runSTS,
} from '@/voiceclone/api/tts'

export default {
    name: 'TTS',
    data() {
        return {
            // ====== 基本模式与模型 ======
            mode: 'tts',                 // 当前工作模式：'tts' 文本转语音 / 'sts' 声音转声音
            model: 'default',            // 当前选中的模型名称
            models: [],                  // 模型列表

            // ====== 语言与语速 ======
            language: '',                // 当前选中的语言代码，如 'zh-cn'
            languageList: [],            // 语言下拉列表
            speed: 1.0,                  // 合成语速：0.1 ~ 2.0，1 为正常

            // ====== 音色与文件 ======
            voiceFile: '',               // 选中的音色文件名
            voiceOptions: [],            // 可用音色列表 [{ name, deletable, ... }]

            // ====== 录音相关 ======
            isRecording: false,          // 是否处于录音中
            recorded: false,             // 是否已经录制完成（可试听/上传）
            mediaRecorder: null,         // MediaRecorder 实例
            audioChunks: [],             // 录音分片数据

            // ====== STS 相关 ======
            stsVoice: '',                // STS 的参考音色
            stsFileName: '',             // 已上传/选中的待转换音频文件名
            stsPreviewUrl: '',           // 当前播放的音频 URL

            // ====== TTS 相关 ======
            ttsPreviewUrl: '',           // TTS 当前试听 URL

            // ====== 计时器与时长 ======
            synthesisTimer: null,        // 合成计时器（setInterval 返回值）
            synthesisSeconds: 0,         // 合成已用秒数
            recordTimer: null,           // 录音计时器（setInterval 返回值）
            recordSeconds: 0,            // 录音已用秒数

            // ====== 界面提示 ======
            warningMessage: '',          // 警告信息（如参数校验）
            tipsMessage: '',             // 过程提示（如合成进度/状态）
            deletingName: '',            // 当前正在删除的音色名

            // ====== 文本输入 ======
            textInput: '',               // 待合成的文本内容

            // ====== 用户标识 ======
            user_id: 'test_user_001',    // 默认测试用户 ID

            langlist: {
                "lang1": "必须选择要试听的声音",
                "lang2": "录制中",
                "lang3": "停止录制后,可使用此按钮",
                "lang4": "已录制",
                "lang5": "开始录制",
                "lang6": "停止录制后,可使用此按钮",
                "lang7": "请选择要上传的文件",
                "lang8": "只可导入srt格式字幕文件",
                "lang9": "请选择一个srt文件",
                "lang10": "必须选择要使用的声音",
                "lang11": "必须输入要合成的文字",
                "lang12": "必须上传要转换的声音wav/mp3文件",
                "lang13": "开始合成，用时可能较久，耐心等待",
                "lang14": "[文字->声音]或[声音->声音]线程还没有启动完毕，请等待",
                "lang15": "已转为wav格式: ",
                "lang16": "速度必须在0.1--2.0之间,1为正常速度,2为两倍速",
                "lang19": "运行中",
                "lang20": "已停止"
            }
        };
    },
    computed: {
        // 当前选择的音色是否可删除
        isCurrentDeletable() {
            if (!Array.isArray(this.voiceOptions) || !this.voiceOptions.length || !this.voiceFile) return false
            const it = this.voiceOptions.find(v => v && v.name === this.voiceFile)
            return !!(it && it.deletable)
        }
    },
    mounted() {
        this.initAudioList();
        this.initLanguageList();
        this.checkModelStatus();
        this.getSessionUser();  // 获取用户 session ID（预留）
    },
    watch: {
        mode: function () {
            // 1) 停计时器 & 清零
            if (this.synthesisTimer) {
                clearInterval(this.synthesisTimer)
                this.synthesisTimer = null
            }
            this.synthesisSeconds = 0

            // 2) 清空提示
            if (typeof this.setTips === 'function') {
                this.setTips('')
            }

            // 3) 停止并清空播放器 + 隐藏
            var audio = this.$refs.resultAudio
            if (audio) {
                try { if (!audio.paused) audio.pause() } catch (e) { }
                audio.src = ''
                if (audio.load) audio.load()
                if (audio.classList) audio.classList.add('d-none')
            }
        }
    },
    beforeDestroy() {
        // 清理定时器，避免内存泄漏
        if (this.synthesisTimer) {
            clearInterval(this.synthesisTimer)
            this.synthesisTimer = null
        }
        if (this.recordTimer) {
            clearInterval(this.recordTimer)
            this.recordTimer = null
        }
        // 确保离开时停止试听
        this.stopStsPreview();
        this.stopTtsPreview();
    },
    methods: {
        toggle(type) {
            this.mode = type;
        },
        setWarning(msg) {
            this.warningMessage = msg
            this.tipsMessage = ''
        },
        setTips(msg) {
            this.tipsMessage = msg
            this.warningMessage = ''
        },
        buildFormData() {
            const fd = new FormData()
            fd.append('text', this.textInput)
            fd.append('voice', this.voiceFile)
            fd.append('language', this.language)
            fd.append('model', this.model)
            fd.append('speed', this.speed)
            return fd
        },
        showGuide(type) {
            const images = {
                tts: '/static/images/guide1.png',
                sts: '/static/images/guide2.png'
            };

            this.$alert(
                `<div style="text-align:center;"><img src="${images[type]}" style="max-width: 105%; height: auto;"></div>`,
                '操作指南',
                { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
            );
        },
        setVoice(event) {
            const name = event.target.value;
            const foundModel = this.models.find(m => m.name === name);
            const modelStatus = foundModel ? foundModel.status : null;

            if (name !== 'default') {
                this.$refs.audioSelect.disabled = true;
                this.$refs.startRecord.disabled = true;
            } else {
                this.$refs.audioSelect.disabled = false;
                this.$refs.startRecord.disabled = false;
            }

            if (name !== 'default' && modelStatus !== 'on') {
                this.$alert('该模型还没有启动，请启动后使用', '提示');
            }
        },
        // 获取可用音色：后端返回 { voices: [{ name, deletable }, ...] }
        async initAudioList() {
            try {
                // 加时间戳，避免删/传之后命中缓存
                const res = await getVoiceListExt({ t: Date.now() });
                const voices = (res && res.data && Array.isArray(res.data.voices))
                    ? res.data.voices
                    : [];

                // 规范化
                this.voiceOptions = voices.map(v => ({
                    name: v.name,
                    deletable: !!v.deletable
                }));

                // 保持当前选择；若当前选择已不存在则回退到第一项
                const has = this.voiceOptions.some(v => v.name === this.voiceFile);
                if (!has) {
                    this.voiceFile = this.voiceOptions.length ? this.voiceOptions[0].name : '';
                }
                const hasSts = this.voiceOptions.some(v => v.name === this.stsVoice);
                if (!hasSts) {
                    this.stsVoice = this.voiceOptions.length ? this.voiceOptions[0].name : '';
                }
            } catch (e) {
                console.error('[initAudioList] 失败：', e);
                this.voiceOptions = [];
                if (this.$message) this.$message.error('获取音色失败');
            }
        },
        // 获取语言列表：后端固定返回 { languages: [{ language_code, language_name }, ...] }
        async initLanguageList() {
            try {
                const res = await getLanguageList();
                const langs = (res && res.data && Array.isArray(res.data.languages))
                    ? res.data.languages
                    : [];

                this.languageList = langs;

                // 默认选中：优先 zh-cn，没有则取第一项
                if (!this.language && langs.length) {
                    const zh = langs.find(x => x.language_code === 'zh-cn');
                    this.language = (zh ? zh.language_code : langs[0].language_code);
                }
            } catch (e) {
                console.error('[initLanguageList] 失败：', e);
                this.languageList = [];
                if (this.$message) this.$message.error('获取语言列表失败');
            }
        },
        uploadSrtFile(event) {
            const file = event.target.files[0];
            if (!file) {
                this.$alert(this.langlist['lang9'], '提示');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                this.textInput = reader.result;
            };
            reader.readAsText(file, 'utf-8');
        },
        async checkModelStatus() {
            try {
                const res = await getModelStatus();
                if (res.data && Object.keys(res.data).length > 0) {
                    this.models = Object.keys(res.data).map(name => ({
                        name,
                        label: `${name}/${res.data[name] ? '已启动' : '已停止'}`,
                        status: res.data[name] ? 'on' : 'off'
                    }));
                }
            } catch {
                this.$message.error('获取模型状态失败');
            }
        },
        async updateModelStatus(modelName, el) {
            try {
                const newStatus = el.status === 'on' ? 'off' : 'on';
                const res = await toggleModelStatus({ status_new: newStatus, name: modelName });
                if (res.data && res.data.code === 0) {
                    this.$message.success(res.data.msg);
                    this.checkModelStatus();
                } else {
                    this.$message.error(res.data.msg || '状态更新失败');
                }
            } catch (error) {
                this.$message.error('状态更新请求失败');
            }
        },
        //  删除音色
        async handleDeleteVoice(item) {
            if (!item || !item.name) return
            if (!item.deletable) {
                if (this.$message) this.$message.warning('该音色不允许删除')
                return
            }

            try {
                await this.$confirm(
                    '确定要删除音色「' + item.name + '」吗？此操作不可撤销。',
                    '提示',
                    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
                )
            } catch (e) {
                return // 用户取消
            }

            this.deletingName = item.name
            try {
                const res = await deleteVoice(item.name)
                const data = res && res.data ? res.data : {}
                const code = typeof data.code === 'number' ? data.code : -1
                const msg = data.msg || '删除失败'

                if (code !== 0) throw new Error(msg)

                if (this.$message) this.$message.success('已删除')

                var deletedName = item.name
                await this.initAudioList()

                if (this.voiceFile === deletedName) {
                    this.voiceFile = this.voiceOptions[0] ? this.voiceOptions[0].name : ''
                }
                if (this.stsVoice === deletedName) {
                    this.stsVoice = this.voiceOptions[0] ? this.voiceOptions[0].name : ''
                }
            } catch (err) {
                var em = (err && err.message) ? err.message : '请稍后重试'
                if (this.$message) this.$message.error('删除失败：' + em)
                console.error('[handleDeleteVoice] 删除失败：', err)
            } finally {
                this.deletingName = ''
            }
        },

        // ---------- TTS：点击“点击试听” ----------
        async playSelectedVoice() {
            // 互斥：开播 TTS 前，先停掉 STS 的试听
            if (typeof this.stopStsPreview === 'function') {
                this.stopStsPreview();
            }

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

                // 错误/结束处理
                el.onended = function () { /* 静默结束 */ };
                el.onerror = () => {
                    if (this.$message) this.$message.error('音频播放失败');
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

        // ---------- TTS：手动停止试听（可在切 Tab/离开页面时调用） ----------
        stopTtsPreview() {
            var el = this.$refs.ttsPreviewAudio;
            if (el && el.pause && el.paused === false) {
                try { el.pause(); } catch (e) { }
            }
        },

        // ---------- 试听 STS 选中的音色 ----------
        async onStsPreview() {
            if (typeof this.stopTtsPreview === 'function') {
                this.stopTtsPreview();
            }

            // 1) 基本校验：必须先选择一个音色
            if (!(typeof this.stsVoice === 'string' && this.stsVoice.length > 0)) {
                if (this.$alert) return this.$alert(this.langlist && this.langlist.lang1 ? this.langlist.lang1 : '请先选择一个声音文件', '提示');
                return;
            }

            try {
                // 2) 生成播放 URL，追加时间戳防缓存
                this.stsPreviewUrl = MEDIA_BASE + '/voicelist/' + encodeURIComponent(this.stsVoice) + '?t=' + Date.now();

                // 3) 使用 STS 专用 <audio> 元素播放
                var el = this.$refs.stsPreviewAudio;
                if (!el) return;

                // 每次播放前复位
                try { el.pause(); } catch (e) { }
                el.currentTime = 0;
                el.src = this.stsPreviewUrl;

                // 4) 绑定一次性事件：结束/错误时的处理
                el.onended = function () {
                };
                el.onerror = () => {
                    if (this.$message) this.$message.error('音频播放失败');
                };

                // 5) 开始播放
                var playPromise = el.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    await playPromise;
                }
            } catch (e) {
                if (this.$message) this.$message.error('音频播放失败');
                console.error('[STS preview] play error:', e);
            }
        },

        // ---------- 停止 STS 试听（切换 Tab / 离开页面时调用） ----------
        stopStsPreview() {
            var el = this.$refs.stsPreviewAudio;
            if (el && el.pause && el.paused === false) {
                try { el.pause(); } catch (e) { }
            }
        },

        startRecording() {
            this.audioChunks = [];
            this.recordSeconds = 0;
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        this.audioChunks.push(event.data);
                    }
                };
                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    this.$refs.audioPlayer.src = audioUrl;
                    this.recorded = true;
                    this.recordedBlob = audioBlob;
                    this.$message.success(this.langlist['lang4']);
                };
                this.mediaRecorder.start();
                this.isRecording = true;
                this.$message.success(this.langlist['lang2']);
                this.recordTimer = setInterval(() => {
                    this.recordSeconds++;
                    if (this.recordSeconds >= 30) {
                        this.stopRecording();
                    }
                }, 1000);
            }).catch(() => {
                this.$message.error('无法启动录音设备');
            });
        },
        stopRecording() {
            if (this.mediaRecorder) {
                this.mediaRecorder.stop();
                this.isRecording = false;
                clearInterval(this.recordTimer);
            }
        },
        //  工具：清理用户输入文件名（不含后缀）
        _sanitizeStem(input) {
            let stem = (input || '').trim()
            if (!stem) stem = 'record'
            // 仅保留：中英文、数字、下划线、点、连字符，其余替换为下划线
            stem = stem.replace(/[^0-9A-Za-z\u4e00-\u9fff._-]+/g, '_')
                .replace(/^[._-]+|[._-]+$/g, '')
            if (!stem) stem = 'record'
            if (stem.length > 80) stem = stem.slice(0, 80)
            return stem
        },
        //  在线录音：上传前先让用户命名 
        async uploadRecording() {
            if (!this.recordedBlob) {
                return this.$alert((this.langlist && this.langlist.lang6) || '请先录音', '提示')
            }

            // 1) 让用户输入期望的文件名
            const { value, action } = await this.$prompt(
                '请输入录音文件名（可不写 .wav，保存时会自动加上）',
                '命名录音',
                {
                    inputPlaceholder: '例如：李老师_课件_音色 或 李老师_课件_音色.wav',
                    confirmButtonText: '保存',
                    cancelButtonText: '取消',
                    inputPattern: /.+/,
                    inputErrorMessage: '文件名不能为空'
                }
            ).catch(() => ({ action: 'cancel' }))

            if (action === 'cancel') return

            // 2) 规范化：去掉扩展名，清理非法字符，长度限制
            let raw = (value || '').trim()
            raw = raw.replace(/\.[A-Za-z0-9]+$/i, '')
            const stem = this._sanitizeStem(raw)

            // 3) 组装 FormData，并使用“用户命名 + .wav”作为第三个参数传给后端
            const fd = new FormData()
            fd.append('audio', this.recordedBlob, `${stem}.wav`) // 第三个参数是“文件名”

            // 4) 调后端上传接口
            const { data } = await uploadAudioFile(fd)

            if (data.code === 0) {
                this.$message.success(`录音上传成功：${data.data}`)
                this.voiceFile = data.data
                this.recorded = false
                await this.initAudioList()
            } else {
                this.$message.error(data.msg || '上传失败')
            }
        },
        async uploadFromLocal(e) {
            const file = e.target.files[0]
            if (!file) return this.$alert(this.langlist.lang7, '提示')

            const fd = new FormData()
            fd.append('audio', file)      // 默认进 voicelist
            const { data } = await uploadAudioFile(fd)

            if (data.code === 0) {
                this.$message.success('上传成功')
                this.voiceFile = data.data
                await this.initAudioList()
            } else {
                this.$message.error(data.msg || '上传失败')
            }
        },

        /* ---------- 文本 → 语音 ---------- */
        async startSynthesis() {
            // 1. 基础校验（保持原判空逻辑）
            if (!this.voiceFile) return this.setWarning(this.langlist.lang10)
            if (!this.textInput) return this.setWarning(this.langlist.lang11)
            if (this.speed < 0.1 || this.speed > 2.0)
                return this.setWarning(this.langlist.lang16)

            // 2. 提示计时
            this.synthesisSeconds = 0
            this.setTips(`${this.langlist.lang13}：0 秒`)
            this.synthesisTimer = setInterval(() => {
                this.synthesisSeconds++
                this.setTips(`${this.langlist.lang13}：${this.synthesisSeconds} 秒`)
            }, 1000)

            try {
                const { data } = await runTTS(this.buildFormData())
                clearInterval(this.synthesisTimer)
                console.log('TTS response', data)

                if (data.code !== 0 || !data.file_url) {
                    return this.setWarning(data.msg || '合成失败')
                }

                const audio = this.$refs.resultAudio
                if (!audio) { console.error('audio ref 未找到'); return }
                audio.src = data.file_url + '?t=' + Date.now()
                audio.load()
                audio.classList.remove('d-none')
                this.setTips('合成成功！')

            } catch (err) {
                clearInterval(this.synthesisTimer)
                this.setWarning('合成请求失败')
                console.error(err)
            }
        },

        /* ---------- 语音 → 语音 ---------- */
        async startSTS() {
            if (!this.stsVoice) return this.setWarning('请选择要克隆的音色')
            if (!this.stsFileName) return this.setWarning('请先上传原始音频')

            /* ---- 计时开始 ---- */
            this.synthesisSeconds = 0
            this.synthesisTimer = setInterval(() => {
                this.synthesisSeconds++
                this.setTips(`转换中，请耐心等待，已用时：${this.synthesisSeconds} 秒`)
            }, 1000)

            const fd = new FormData()
            fd.append('voice', this.stsVoice)
            fd.append('name', this.stsFileName)

            try {
                const { data } = await runSTS(fd)
                clearInterval(this.synthesisTimer)

                if (data.code !== 0 || !data.file_url)
                    return this.setWarning(data.msg || '转换失败')

                const audio = this.$refs.resultAudio
                audio.src = data.file_url + '?t=' + Date.now()   // 防缓存
                audio.load()
                audio.classList.remove('d-none')
                this.setTips('转换成功！')

            } catch (e) {
                clearInterval(this.synthesisTimer)
                this.setWarning('转换请求失败')
                console.error(e)
            }
        },

        /* 拖拽 / 选择文件后上传到 tmp/ 并记录文件名 */
        async handleFileUpload(event) {
            const file = (event.dataTransfer || event.target).files[0]
            if (!file) return

            const fd = new FormData()
            fd.append('audio', file)
            fd.append('save_dir', 'tmp')           // 让后端存 TMP_DIR

            const { data } = await uploadAudioFile(fd)   // /upload_audio
            if (data.code !== 0) {
                return this.setWarning(data.msg || '上传失败')
            }

            this.stsFileName = data.data || ''
        },

        triggerFileInput() {
            this.$refs.stsFileInput.click();
        },
        handleFileChange(event) {
            const files = event.target.files;
            if (files.length > 0) {
                this.handleFileDrop({ dataTransfer: { files } });
            }
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
};
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

.form-select {
    height: calc(2.5rem + 2px);
}

.form-control {
    border-radius: .25rem;
    margin-top: .5rem;
}

.form-text {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.5rem;
}

.btn-file {
    position: relative;
    overflow: hidden;
}

.btn-file input[type="file"] {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
    padding: 0;
    font-size: 20px;
    cursor: pointer;
    opacity: 0;
    filter: alpha(opacity=0);
}

#dropaudio {
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    background: #fff;
}

#dropaudio.dragover {
    background-color: #f0f0f0;
}



/* Vue2 深度选择器：>>> 或 /deep/ 都可 */
.form-select-compat>>>.el-input .el-input__inner {
    height: 42px !important;
    line-height: 42px !important;
    font-size: 14.5px !important;
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