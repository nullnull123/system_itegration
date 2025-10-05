<template>
    <div class="container mb-2" style="padding: 15px;">
        <div class="alert rounded-0">
            <p class="mb-0 custom-text">用自己的声音或使用任意音色录制一段音频</p>
            <p class="mb-0 custom-text">用于克隆的最佳音频素材时长为 30s-120s, 为确保清晰准确的人声不要有杂音、背景音</p>
        </div>

        <div class="my-2 btn-group">
            <button @click="toggle('tts')" :class="['btn border', mode === 'tts' ? 'btn-primary' : '']"
                style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">文本转语音(Text-to-Speech)</button>
            <button @click="toggle('sts')" :class="['btn border', mode === 'sts' ? 'btn-primary' : '']"
                style="border-top-right-radius: 8px; border-bottom-right-radius: 8px;">音色转换(Speech-to-Speech)</button>
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
                        <audio ref="ttsPreviewAudio" class="d-none" preload="metadata"></audio>
                        <el-select ref="voiceSelect" v-model="voiceFile" filterable placeholder="选择声音文件"
                            class="form-select-compat" popper-class="form-select-popper" style="width:105%;">
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
                    <button @click="startSynthesis" class="btn btn-danger" :disabled="isTtsConverting"
                        :title="isTtsConverting ? '正在合成，请稍候…' : '开始生成'">
                        {{ isTtsConverting ? '合成中…' : '立即开始生成' }}
                    </button>
                </div>

                <div class="text-danger text-center my-2" v-if="warningMessage">{{ warningMessage }}</div>
                <div class="text-danger text-center my-2" v-if="tipsMessage">{{ tipsMessage }}</div>

                <!-- TTS 结果试听 -->
                <div v-if="showTtsPlayer" class="audio-compare my-4">
                    <div class="audio-compare-item">
                        <span class="audio-title">合成结果试听</span>
                        <audio ref="ttsAudio" controls preload="metadata"></audio>
                    </div>
                </div>
            </div>

            <div v-show="mode === 'sts'">
                <div class="p-2 d-flex align-items-center" style="gap:8px;">
                    <label class="form-label" style="margin-bottom: 0px;">要克隆的音色:</label>
                    <el-select v-model="stsVoice" filterable placeholder="选择声音文件" class="form-select-compat"
                        popper-class="form-select-popper" style="min-width: 260px; margin-left: 8px;">
                        <el-option v-for="opt in voiceOptions" :key="opt.name" :label="opt.name" :value="opt.name">
                            <div class="d-flex align-items-center w-100" style="gap:8px;">
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
                    <audio ref="stsPreviewAudio" class="d-none" preload="metadata"></audio>
                </div>

                <!-- 上传灰框：拖拽或点击 -->
                <div ref="dropZone" class="border m-2 p-5 text-center" style="cursor:pointer;"
                    @drop.prevent="handleFileUpload" @dragover.prevent @click="triggerFileInput">
                    {{ stsFileName ? '✅ 已上传：' + stsFileName : '拖拽或点击将音频 wav/mp3/flac 文件上传' }}
                </div>
                <input type="file" accept=".mp3,.wav,.flac" ref="stsFileInput" class="d-none"
                    @change="handleFileUpload">

                <div class="text-center mt-3">
                    <button @click="startSTS" class="btn btn-danger" :disabled="isConverting"
                        :title="isConverting ? '正在转换，请稍候…' : '开始转换'">
                        {{ isConverting ? '转换中…' : '立即开始转换' }}
                    </button>
                </div>

                <div class="text-danger text-center my-2" v-if="warningMessage">{{ warningMessage }}</div>
                <div class="text-danger text-center my-2" v-if="tipsMessage">{{ tipsMessage }}</div>

                <!-- 对比试听区域 -->
                <div v-if="showUploadedPreview || showResultPreview" class="audio-compare my-4">
                    <!-- 原始音频 -->
                    <div class="audio-compare-item" v-if="showUploadedPreview">
                        <span class="audio-title">原始音频试听</span>
                        <audio ref="uploadedAudio" controls preload="metadata"></audio>
                    </div>
                    <!-- 转换结果 -->
                    <div class="audio-compare-item" v-if="showResultPreview">
                        <span class="audio-title">转换结果试听</span>
                        <audio ref="resultAudio" controls preload="metadata"></audio>
                    </div>
                </div>
            </div>
        </div>

        <!-- 命名录音(带匹配) -->
        <el-dialog title="录音命名" :visible.sync="nameDlgVisible" width="430px" @open="prepareVoiceNameCache"
            @close="cancelNameDialog">
            <div>
                <!-- 提示文字 -->
                <p class="mb-2" style="font-size:14px; color:#606266;">
                    请输入录音文件名（可不写 .wav，保存时会自动加上）
                </p>
                <!-- 输入框本体 -->
                <el-autocomplete class="rename-input" v-model="nameInput" :fetch-suggestions="queryLocalNameSuggestions"
                    placeholder="例如：李老师_课件_音色 或 李老师_课件_音色.wav" :trigger-on-focus="true" :debounce="120"
                    @select="onPickSuggestedName" style="width:100%" />
                <small v-if="nameExists" class="text-danger d-block mt-2" style="font-size:14px;">
                    已存在同名音色，请更换名称
                </small>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelNameDialog">取 消</el-button>
                <el-button type="primary" @click="confirmNameDialog">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
const MEDIA_BASE =  '/api/media';   // 统一的媒体前缀
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
            speed: 1.0,                  // 合成语速

            // ====== 音色文件 ======
            voiceFile: '',               // 选中的音色文件名
            voiceOptions: [],            // 可用音色列表 [{ name, deletable, ... }]
            deletingName: '',            // 当前正在删除的音色名

            // ====== 录音相关 ======
            isRecording: false,          // 是否处于录音中
            recorded: false,             // 是否已经录制完成
            mediaRecorder: null,         // MediaRecorder 实例
            audioChunks: [],             // 录音分片数据
            recordedBlob: null,          // 存放录制后的 Blob
            recordTimer: null,           // 录音计时器
            recordSeconds: 0,            // 录音已用秒数

            // ====== STS 相关 ======
            stsVoice: '',                // STS 的参考音色
            stsFileName: '',             // 已上传/选中的待转换音频文件名
            stsPreviewUrl: '',           // STS 当前试听 URL
            showUploadedPreview: false,  // 是否显示“原始音频试听”
            showResultPreview: false,    // 是否显示“转换结果试听”
            isConverting: false,         // 转换中禁用按钮
            _uploadedBlobUrl: null,      // 上一次生成的 blob 地址

            // ====== TTS 相关 ======
            ttsPreviewUrl: '',           // TTS 当前试听 URL
            isTtsConverting: false,      // TTS 合成中
            showTtsPlayer: false,        // 是否显示 TTS 播放器

            // ====== 计时器与时长 ======
            synthesisTimer: null,        // 合成计时器
            synthesisSeconds: 0,         // 合成已用秒数
            _timerStartAt: 0,            // 起点时间

            // ====== 界面提示 ======
            warningMessage: '',          // 警告信息
            tipsMessage: '',             // 过程提示

            // ====== 文本输入 ======
            textInput: '',               // 待合成的文本内容

            // ====== 命名对话框 ======
            nameDlgVisible: false,       // 命名弹窗是否可见
            nameInput: "",               // 弹窗中的命名输入
            nameExists: false,           // 是否存在完全同名
            _voiceNameCache: [],         // 从后端拉取的所有文件名缓存

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
        this.bindExclusivePlayback();
        this.getSessionUser();  // 获取用户 session ID（预留）
    },
    watch: {
        mode() {
            // 停止计时器
            this.stopProgress()
            this.synthesisSeconds = 0

            // 清空提示
            this.setTips && this.setTips('')

            // 重置播放器显示状态
            this.resetTtsPlayer();
            this.resetStsResultPlayer();
            this.showTtsPlayer = false
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
        if (this._uploadedBlobUrl) {
            URL.revokeObjectURL(this._uploadedBlobUrl);
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

        // 计时启动
        startProgress(labelText) {
            // 记录墙钟起点
            this._timerStartAt = Date.now()
            this.synthesisSeconds = 0
            this.setTips(`${labelText}：0 秒`)

            if (this.synthesisTimer) {
                clearInterval(this.synthesisTimer)
                this.synthesisTimer = null
            }

            // 每秒刷新，显示值来自墙钟差值
            this.synthesisTimer = setInterval(() => {
                const sec = Math.floor((Date.now() - this._timerStartAt) / 1000)
                this.synthesisSeconds = sec
                this.setTips(`${labelText}：${sec} 秒`)
            }, 1000)
        },

        // 计时停止
        stopProgress() {
            if (this.synthesisTimer) {
                clearInterval(this.synthesisTimer)
                this.synthesisTimer = null
            }
        },

        // 隐藏并清空 TTS 结果播放器
        resetTtsPlayer() {
            this.showTtsPlayer = false;

            const el = this.$refs.ttsAudio;
            if (!el) return;  

            if (!el.paused) {
                el.pause();
            }

            el.removeAttribute('src');
            el.load();
        },

        // 隐藏并清空 STS 结果播放器
        resetStsResultPlayer() {
            this.showResultPreview = false;

            const el = this.$refs.resultAudio;
            if (!el) return;

            if (!el.paused) {
                el.pause();
            }

            el.removeAttribute('src');
            el.load();
        },

        promoteVoice(newName) {
            if (!newName) return;

            // 如果列表里已经有它，就沿用原有 deletable 等字段；没有就当作用户新增
            const existed = this.voiceOptions.find(v => v && v.name === newName);
            const newItem = existed || { name: newName, deletable: true };

            // 去重后插到最前面
            this.voiceOptions = [newItem, ...this.voiceOptions.filter(v => v.name !== newName)];

            // 选中它
            this.voiceFile = newName;
            this.stsVoice = newName;

            // 若当前在搜索（filterable），清空关键字，避免新项被过滤
            this.$nextTick(() => {
                if (this.$refs.voiceSelect) {
                    this.$refs.voiceSelect.query = '';
                    this.$refs.voiceSelect.blur && this.$refs.voiceSelect.blur();
                }
            });
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

        //  打开命名对话框
        openNameDialog() {
            return new Promise(resolve => {
                this.nameInput = ""
                this.nameExists = false
                this.nameDlgVisible = true
                // 暂存回调，确认时取出
                this._resolveNamePromise = resolve
            })
        },

        //  打开对话框时准备缓存
        async prepareVoiceNameCache() {
            try {
                const { data } = await getVoiceListExt()
                const arr = (data && data.voices) ? data.voices : []
                this._voiceNameCache = arr
                    .filter(x => x && x.name)
                    .map(x => String(x.name))
            } catch (e) {
                this._voiceNameCache = []
            }
        },

        //  el-autocomplete 的数据源：本地联想（首字母/包含）
        queryLocalNameSuggestions(queryString, cb) {
            const q = (queryString || "").trim().toLowerCase()
            const list = this._voiceNameCache
                .filter(n => !q || n.toLowerCase().includes(q) || n.toLowerCase().startsWith(q))
                .slice(0, 10)
                .map(n => ({ value: n }))
            // 同步“是否完全重名”
            this.nameExists = !!q && this._voiceNameCache
                .some(v => v.toLowerCase() === (q.endsWith('.wav') ? q : `${q}.wav`))
            cb(list)
        },

        //  点击取消：关闭弹窗并让 openNameDialog() 返回 null
        cancelNameDialog() {
            this.nameDlgVisible = false
            const resolve = this._resolveNamePromise
            this._resolveNamePromise = null

            // 让 await openNameDialog() 收到 null（表示取消）
            resolve && resolve(null)
        },

        //  点击“保存”：校验 + 关闭并返回
        confirmNameDialog() {
            const raw = (this.nameInput || "").trim()
            if (!raw) {
                this.$message.warning('文件名不能为空')
                return
            }
            const stem = this._sanitizeStem(raw.replace(/\.[A-Za-z0-9]+$/i, ''))

            // 完全同名（含 .wav）判断
            this.nameExists = this._voiceNameCache
                .some(v => v.toLowerCase() === `${stem}.wav`.toLowerCase())
            if (this.nameExists) {
                this.$message.warning('已存在同名文件，请更换名称或直接使用该音色')
                return
            }

            this.nameDlgVisible = false
            const resolve = this._resolveNamePromise
            this._resolveNamePromise = null
            resolve && resolve(stem)
        },

        onPickSuggestedName(item) {
            this.nameInput = item.value || ''
            this.nameExists = true
        },

        //  在线录音：上传前先弹出“联想命名”对话框
        async uploadRecording() {
            if (!this.recordedBlob) {
                return this.$alert((this.langlist && this.langlist.lang6) || '请先录音', '提示')
            }

            // 1) 打开带联想的命名弹窗，等待用户确认
            const stem = await this.openNameDialog()
            if (!stem) return  // 用户取消

            // 2) 组装 FormData，用“用户命名 + .wav”作为文件名传给后端
            const fd = new FormData()
            fd.append('audio', this.recordedBlob, `${stem}.wav`)

            // 3) 调用后端上传接口
            const { data } = await uploadAudioFile(fd)

            if (data.code === 0) {
                const newName = data.data
                this.$message.success('录音上传成功：' + newName)
                await this.initAudioList()

                // 置顶 + 选中
                this.promoteVoice(newName)

                this.recorded = false
            } else {
                this.$message.error(data.msg || '上传失败')
            }
        },

        // 从本地选择并上传为音色：上传 → 刷新 → 置顶+选中 → 清空<input>值
        async uploadFromLocal(e) {
            const file = e && e.target ? e.target.files[0] : null;
            if (!file) {
                this.$alert((this.langlist && this.langlist.lang7) || '请选择一个音频文件', '提示');
                return;
            }

            const fd = new FormData();
            fd.append('audio', file);  // 默认保存到 voicelist

            try {
                const { data } = await uploadAudioFile(fd);
                if (data.code === 0) {
                    const newName = data.data;
                    this.$message.success('上传成功：' + newName);

                    await this.initAudioList(); // 刷新音色列表
                    this.promoteVoice && this.promoteVoice(newName); // 置顶+选中
                } else {
                    this.$message.error(data.msg || '上传失败');
                }
            } catch (err) {
                this.$message.error('上传失败，请稍后重试');
            } finally {
                // 清空 <input type="file"> 的值，避免再次选择同一文件不触发 change
                if (e && e.target) {
                    try { e.target.value = ''; } catch (_) { }
                }
            }
        },

        /* ---------- 文本 → 语音 ---------- */
        async startSynthesis() {
            this.resetTtsPlayer();

            // 1) 基础校验
            if (!this.voiceFile) return this.setWarning(this.langlist.lang10);
            if (!this.textInput) return this.setWarning(this.langlist.lang11);
            if (this.speed < 0.1 || this.speed > 2.0) return this.setWarning(this.langlist.lang16);

            // 2) 状态与计时
            this.isTtsConverting = true;
            this.startProgress(this.langlist.lang13);

            try {
                // 3) 请求后端
                const resp = await runTTS(this.buildFormData());
                const payload = (resp && resp.data) ? resp.data : resp;
                console.log('TTS response', payload);

                if (!payload || payload.code !== 0 || !payload.file_url) {
                    return this.setWarning((payload && payload.msg) || '合成失败');
                }

                // 4) 成功：设置并显示 TTS 播放器
                this.showTtsPlayer = true;

                this.$nextTick(() => {
                    const el = this.$refs && this.$refs.ttsAudio;
                    if (!el) { console.error('ttsAudio ref 未找到'); return; }

                    el.src = payload.file_url + '?t=' + Date.now();    // 防缓存
                    el.load();
                    this.stopProgress();
                    this.setTips('合成成功！');
                });
            } catch (err) {
                this.setWarning('合成请求失败');
                console.error(err);
            } finally {
                // 5) 统一清理计时 & 状态
                this.stopProgress();
                this.isTtsConverting = false;
            }
        },

        /* ---------- 语音 → 语音 ---------- */
        async startSTS() {
            this.resetStsResultPlayer();

            if (!this.stsVoice) return this.setWarning('请选择要克隆的音色');
            if (!this.stsFileName) return this.setWarning('请先上传原始音频');

            this.isConverting = true;
            this.startProgress('转换中，请耐心等待，已用时');

            var fd = new FormData();
            fd.append('voice', this.stsVoice);
            fd.append('name', this.stsFileName);

            try {
                const resp = await runSTS(fd);
                const payload = (resp && typeof resp === 'object' && 'data' in resp) ? resp.data : resp;

                if (!payload || payload.code !== 0 || !payload.file_url) {
                    this.setWarning((payload && payload.msg) || '转换失败');
                    return;
                }

                this.showResultPreview = true;
                const fileUrl = payload.file_url + '?t=' + Date.now();
                this.$nextTick(async () => {
                    const audio = this.$refs && this.$refs.resultAudio;
                    if (audio) {
                        audio.src = fileUrl;
                        audio.load();
                        this.bindExclusivePlayback();
                    }
                });
                this.stopProgress();
                this.setTips('转换成功！');
            } catch (e) {
                this.setWarning('转换请求失败');
                console.error(e);
            } finally {
                this.stopProgress();
                this.isConverting = false;
            }
        },

        /* 拖拽 / 选择文件后上传到 tmp/ 并记录文件名 + 本地试听 */
        async handleFileUpload(event) {
            // 兼容拖拽与点击选择
            var file = null;
            if (event && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                file = event.dataTransfer.files[0];
            } else if (event && event.target && event.target.files && event.target.files.length > 0) {
                file = event.target.files[0];
            }
            if (!file) return;

            // 1) 上传到后端 tmp 目录
            var fd = new FormData();
            fd.append('audio', file);
            fd.append('save_dir', 'tmp');

            let resp;
            try {
                resp = await uploadAudioFile(fd);
            } catch (e) {
                this.setWarning('上传失败');
                return;
            }

            const payload = (resp && typeof resp === 'object' && 'data' in resp) ? resp.data : resp;
            if (!payload || payload.code !== 0) {
                this.showUploadedPreview = false;
                return this.setWarning((payload && payload.msg) || '上传失败');
            }

            // 记录后端返回的文件名
            this.stsFileName = payload.data || '';

            // 2) 本地即时试听
            this.showUploadedPreview = true;
            this.$nextTick(() => {
                try {
                    if (this._uploadedBlobUrl) URL.revokeObjectURL(this._uploadedBlobUrl);
                    this._uploadedBlobUrl = URL.createObjectURL(file);

                    const el = this.$refs && this.$refs.uploadedAudio;
                    if (el) {
                        el.src = this._uploadedBlobUrl;
                        this.bindExclusivePlayback();
                    }
                } catch (e) { console.warn('本地试听初始化失败：', e); }
            });

            // 3) 在下一轮事件循环，把 blob 地址替换为服务端稳定 URL，然后释放 blob
            setTimeout(() => {
                const el2 = this.$refs && this.$refs.uploadedAudio;
                if (!el2) return;

                const serverUrl = MEDIA_BASE + '/tmp/' + encodeURIComponent(this.stsFileName);
                el2.src = serverUrl + '?t=' + Date.now();
                if (el2.load) el2.load();

                // 释放本地 blob，避免内存泄漏
                try {
                    if (this._uploadedBlobUrl) URL.revokeObjectURL(this._uploadedBlobUrl);
                } catch (_) { }
                this._uploadedBlobUrl = null;
            }, 0);


            // 4) 重置 input，确保选择同名文件也能再次触发
            if (this.$refs && this.$refs.stsFileInput) {
                this.$refs.stsFileInput.value = '';
            }
        },

        /* 点击“上传灰框”时，触发隐藏的 input */
        triggerFileInput() {
            this.$refs.stsFileInput && this.$refs.stsFileInput.click();
        },

        // 暂停除 activeRef 外的其它播放器
        exclusivePauseOthers(activeRef) {
            const list = [
                this.$refs.uploadedAudio,   // 原始音频试听
                this.$refs.resultAudio,     // 转换结果试听
                this.$refs.stsPreviewAudio  // 音色样例试听
            ].filter(Boolean);

            list.forEach(a => {
                if (a !== activeRef && !a.paused) a.pause();
            });
        },

        // 给播放器绑定互斥播放
        bindExclusivePlayback() {
            const list = [
                this.$refs.uploadedAudio,
                this.$refs.resultAudio,
                this.$refs.stsPreviewAudio,
            ].filter(Boolean);

            list.forEach(a => {
                if (!a._exclusiveBound) {
                    a.addEventListener('play', () => this.exclusivePauseOthers(a));
                    a._exclusiveBound = true;  // 避免重复绑定
                }
            });
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

.audio-compare {
    display: flex;
    gap: 24px;
    justify-content: center;
    flex-wrap: wrap;
}

.audio-compare-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 14px;
    padding: 10px 14px;
    min-width: 380px;
    max-width: 48%;
    flex: 1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.audio-compare-item audio {
    flex: 1;
    outline: none;
}

.audio-title {
    white-space: nowrap;
    font-weight: 600;
    color: #0d6efd;
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

.rename-input /deep/ .el-input--small .el-input__inner {
    height: 40px;
    line-height: 32px;
    font-size: 15px;
    padding: 0 12px;
    border-radius: 6px;
}

/* 占位符字体也同步放大 */
.rename-input ::v-deep .el-input__inner::placeholder {
    font-size: 15px;
}
</style>