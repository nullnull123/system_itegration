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
            <div id="model_list" class="btn-group overflow-auto w-100 p-1" style="white-space: nowrap"></div>
            <div id="tts-area">
                <div class="row mb-3 d-flex justify-content-center align-items-center gap-md-4">
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <label for="model" class="form-label w-auto">使用模型：</label>
                            <select @change="set_voice($event)" class="form-select w-auto" name="model" id="model">
                                <option value="default">默认</option>
                            </select>
                        </div>
                        <div class="d-flex align-items-center mt-3">
                            <label for="languageSelect" class="form-label w-auto">文本语言：</label>
                            <select class="form-select w-auto" id="languageSelect" ref="languageSelect"></select>
                        </div>
                    </div>

                    <div class="col-md-3" style="margin-right: 30px; padding-left: 0px">
                        <label for="audioSelect" class="form-label">要使用的声音文件:<a href="javascript:;" @click="playVoice"
                                class="form-text">点击试听</a></label>
                        <select class="form-select" id="audioSelect" ref="audioSelect" style="width: 240px !important"
                            @change="setVoice">
                            <option v-for="file in audioList" :key="file" :value="file">{{ file }}</option>
                        </select>
                        <div class="form-text" style="width: 250px">
                            <label class="btn btn-sm btn-secondary btn-file d-inline-block position-relative">
                                <span>从本地上传</span>
                                <input id="fileInput" type="file" accept="audio/wav, audio/mp3,audio/flac"
                                    class="position-absolute start-0 top-0 end-0 bottom-0 opacity-0"
                                    @change="uploadFromLocal($event)" />
                            </label>
                            或在线录制30s的音频,即可在此选择使用
                        </div>
                    </div>

                    <div class="col-md-3 d-flex flex-column align-items-center justify-content-between"
                        style="height: 100px">
                        <div class="d-flex flex-row justify-content-between w-100 mb-1">
                            <button class="btn btn-sm btn-primary btn-record" id="startRecord"
                                ref="startRecord">开始录制</button>
                            <button class="btn btn-sm btn-danger btn-record" id="stopRecord" ref="stopRecord"
                                disabled>停止录制</button>
                            <button class="btn btn-sm btn-success btn-record" id="upload" ref="upload"
                                disabled>使用该录音</button>
                        </div>
                        <audio style="width: 280px" class="w-10" id="audioPlayer" controls></audio>
                    </div>
                </div>

                <div class="mt-4">
                    <strong class="text-primary">填写要处理的txt所在目录完整路径(打开文件夹复制地址栏)</strong>
                    <input id="txt_dir" ref="txt_dir" class="form-control"
                        placeholder="这里填写要批量处理的txt所在目录完整路径 (例如：D:\360MoveData\Users\CZY\Desktop\input)" type="text" />
                </div>

                <div class="mt-4">
                    <strong class="text-primary">填写要保存到的文件夹完整路径(打开文件夹复制地址栏)</strong>
                    <input id="txt_out" ref="txt_out" class="form-control"
                        placeholder="这里填写输出目标文件夹完整路径 (例如：D:\360MoveData\Users\CZY\Desktop\output)" type="text" />
                </div>

                <div class="row mt-4">
                    <div class="col-md-12 text-center position-relative mb-2">
                        <button id="start_button" ref="start_button" @click="start"
                            class="btn btn-danger btn-start-record">立即开始生成</button>
                    </div>
                    <div class="col-md-12 d-none text-danger text-center" id="tips" ref="tips"></div>
                    <div style="max-height: 300px" class="col-md-12 overflow-auto d-none alert alert-primary"
                        id="result_text" ref="result_text"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const MEDIA_BASE = 'http://127.0.0.1:9988/media';   // 统一的媒体前缀
import {
    uploadAudioFile,
    getAudioList,
    getLanguageList,
    runBatchTTS,
    getBatchProgress,
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
            audioList: [],        // 下拉框选项
            voice: '',            // 当前选中的文件名
            currentAudio: null,   // 正在播放的 Audio 对象
            mediaRecorder: null,
            audioChunks: [],
            sec: 0,
            timeid: null,
            mode: 'tts',
            lastmsg: '',          // 上一次已渲染的消息
            started: false,       // 本轮任务是否已真正开始
            messageSet: new Set(),   // 存放已显示过的消息，用于彻底去重
            tips: '',      // 页面上显示的提示文字
            user_id: 'test_user_001',  // 默认测试用户 ID
        }
    },
    mounted() {
        this.init();
        this.bindRecordEvents();
        this.getSessionUser();  // 获取用户 session ID（预留）
    },
    methods: {
        toggle(type) {
            this.mode = type;
        },
        showGuide() {
            this.$alert(
                '<div style="text-align:center;"><img src="/static/images/guide3.png" style="max-width:100%;"></div>',
                '操作指南',
                {
                    dangerouslyUseHTMLString: true,
                    center: true
                }
            );
        },
        playVoice() {
            // 下拉框引用
            const sel = this.$refs.audioSelect;
            if (!sel || !sel.value) {
                this.$message.warning(this.langlist.lang1);  // “请选择音频” 等提示
                return;
            }

            // 拼 URL，与 VoiceCloning.vue 保持一致
            const url = `${MEDIA_BASE}/voicelist/${sel.value}?t=${Date.now()}`;

            // 若有旧音频在播，先停
            if (this.currentAudio) this.currentAudio.pause();

            this.currentAudio = new Audio(url);
            this.currentAudio.play().catch(err => {
                console.error(err);
                this.$message.error('音频播放失败');
            });
        },

        setVoice(event) {
            const name = event.target.value;
            this.voice = name;
            this.$refs.audioSelect.disabled = false;
            this.$refs.startRecord.disabled = false;
        },

        bindRecordEvents() {
            const startBtn = this.$refs.startRecord;
            const stopBtn = this.$refs.stopRecord;
            const uploadBtn = this.$refs.upload;

            if (startBtn) startBtn.addEventListener('click', this.startRecording);
            if (stopBtn) stopBtn.addEventListener('click', this.stopRecording);
            if (uploadBtn) uploadBtn.addEventListener('click', this.uploadRecording);
        },
        startRecording() {
            this.audioChunks = [];
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        this.audioChunks.push(event.data);
                    }
                };
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const url = URL.createObjectURL(blob);
                    this.$refs.audioPlayer.src = url;
                    this.$refs.upload.disabled = false;
                };
                this.mediaRecorder.start();
                this.sec = 0;
                this.timeid = setInterval(() => {
                    this.sec++;
                    this.$refs.startRecord.innerText = `${this.langlist.lang4}${this.sec}s`;
                    if (this.sec > 30) this.stopRecording();
                }, 1000);
                this.$refs.startRecord.disabled = true;
                this.$refs.stopRecord.disabled = false;
                this.$refs.upload.disabled = true;
            });
        },
        stopRecording() {
            if (this.mediaRecorder) this.mediaRecorder.stop();
            this.$refs.startRecord.disabled = false;
            this.$refs.startRecord.innerText = this.langlist.lang5;
            this.$refs.stopRecord.disabled = true;
            this.$refs.upload.disabled = false;
            clearInterval(this.timeid);
            this.sec = 0;
        },
        uploadRecording() {
            const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', blob, 'record.wav');
            uploadAudioFile(formData)
                .then(({ data }) => {
                    if (data.code === 0) {
                        const option = document.createElement('option');
                        option.value = data.data;
                        option.text = data.data;
                        option.selected = true;
                        this.$refs.audioSelect.prepend(option);
                        this.$refs.upload.disabled = true;
                    }
                });
        },
        uploadFromLocal(e) {
            const file = e.target.files[0];
            if (!file) {
                this.$message.warning(this.langlist.lang7);
                return;
            }
            const formData = new FormData();
            formData.append('audio', file);
            uploadAudioFile(formData)
                .then(({ data }) => {
                    if (data.code === 0) {
                        const option = document.createElement('option');
                        option.value = data.data;
                        option.text = data.data;
                        option.selected = true;
                        this.$refs.audioSelect.prepend(option);
                    }
                });
        },
        async fetchVoices() {
            try {
                const { data } = await getAudioList();  // 后端 /init/
                const list = Array.isArray(data) ? data : (data.list || []);
                const select = this.$refs.audioSelect;
                select.innerHTML = '';

                list.forEach(name => {
                    const op = document.createElement('option');
                    op.value = name;
                    op.text = name;
                    select.appendChild(op);
                });
            } catch (e) {
                console.error('拉取声音文件列表失败', e);
            }
        },

        async fetchLanguages() {
            try {
                const { data } = await getLanguageList()  // 后端 /get_languages/
                // 假设返回 {code:0,languages:[{language_code,name}...]}
                const langs = data.languages || []
                const select = this.$refs.languageSelect
                select.innerHTML = ''
                langs.forEach(lang => {
                    const op = document.createElement('option')
                    op.value = lang.language_code
                    op.text = lang.language_name
                    select.appendChild(op)
                })
            } catch (e) {
                console.error('拉取语言列表失败', e)
            }
        },


        /* ========== 初始化：拉声音 / 语言列表，填进下拉框 ========== */
        init() {
            Promise.all([this.fetchVoices(), this.fetchLanguages()])
                .catch(err => console.error('初始化下拉框失败', err))
        },

        beforeDestroy() {
            if (this.timeid) clearTimeout(this.timeid)
        },

        /* ========== 点击“立即开始生成” ========== */
        start() {
            /* ---- 初始化 ---- */
            this.lastmsg = '';
            this.started = false;
            this.messageSet = new Set();                        // ← 清空去重集合
            this.$refs.result_text.innerHTML = '';
            this.$refs.result_text.classList.add('d-none');

            const voice = this.$refs.audioSelect.value;
            const lang = this.$refs.languageSelect.value;
            const src = this.$refs.txt_dir.value;
            const dst = this.$refs.txt_out.value;

            if (!voice) return this.$message.warning(this.langlist.lang10);
            if (!src) return this.$message.warning('必须填写要批量处理的txt所在目录');
            if (!dst) return this.$message.warning('必须填写目标目录');

            const formData = new FormData();
            formData.append('voice', voice);
            formData.append('language', lang);
            formData.append('src', src);
            formData.append('dst', dst);
            formData.append('speed', this.speed || 1.0);

            this.$refs.tips.classList.remove('d-none');
            this.$refs.tips.innerText = '任务已提交，正在处理中…';
            this.$refs.start_button.disabled = true;

            runBatchTTS(formData)
                .then(({ data }) => {
                    if (data.code === 0) {
                        this.pollProgress();            // 成功后开始轮询
                    } else {
                        this.$refs.tips.innerText = data.msg || '任务提交失败';
                        this.$refs.start_button.disabled = false;
                    }
                })
                .catch(() => {
                    this.$refs.tips.innerText = '网络错误，任务提交失败';
                    this.$refs.start_button.disabled = false;
                });
        },

        /* ========== 轮询后端进度 ========== */
        // pollProgress() {
        //     getBatchProgress()
        //         .then(({ data }) => {
        //             console.log('[poll] 返回数据:', data);

        //             // ---------- 0. 忽略前一次残留状态 ----------
        //             if (data.end && (!data.name || data.line === 0) && !this.started) {
        //                 console.log('[poll] 忽略上一轮的残留状态（end 且未开始）');
        //                 return this.pollProgress();
        //             }

        //             this.started = true;
        //             console.log('[poll] 本轮任务开始');

        //             // ---------- 1. 判断是否本轮有效 ----------
        //             let msg = '';

        //             if (data.name && data.line === 0) {
        //                 msg = `开始处理文件：${data.name}`;
        //                 console.log('[poll] =>', msg);
        //             } else if (data.name && data.line > 0) {
        //                 msg = `正在处理文件：${data.name} ，第 ${data.line} 行`;
        //                 console.log('[poll] =>', msg);
        //             }

        //             // ---------- 2. 渲染进度（防重复） ----------
        //             if (msg && !this.messageSet.has(msg)) {
        //                 console.log('[poll] 渲染提示:', msg);
        //                 this.messageSet.add(msg);
        //                 this.$refs.result_text.classList.remove('d-none');
        //                 this.$refs.result_text.insertAdjacentHTML('beforeend', `<p>${msg}</p>`);
        //                 this.$refs.result_text.scrollTop = this.$refs.result_text.scrollHeight;
        //             } else {
        //                 console.log('[poll] 提示跳过（重复或空）:', msg);
        //             }

        //             // ---------- 3. 判断是否结束 ----------
        //             if (data.end && data.name) {
        //                 const endMsg = '全部执行完毕';
        //                 console.log('[poll] 检测到任务结束');

        //                 if (!this.messageSet.has(endMsg)) {
        //                     this.messageSet.add(endMsg);
        //                     this.$refs.result_text.insertAdjacentHTML('beforeend', `<p>${endMsg}</p>`);
        //                 }

        //                 clearTimeout(this.timeid);
        //                 this.timeid = null;
        //                 this.$refs.start_button.disabled = false;
        //                 this.$refs.tips.innerText = '';

        //                 // === 允许用户再次使用录音按钮 ===
        //                 this.$refs.startRecord.disabled = false;
        //                 this.$refs.upload.disabled = false;
        //             } else {
        //                 console.log('[poll] 尚未结束，继续轮询');
        //                 this.timeid = setTimeout(() => this.pollProgress(), 3000);
        //             }
        //         })
        //         .catch((err) => {
        //             console.warn('[poll] 异常', err);
        //             this.timeid = setTimeout(() => this.pollProgress(), 3000);
        //         });
        // },


        pollProgress() {
            getBatchProgress()
                .then(({ data }) => {
                    console.log('[poll] 返回数据:', data);

                    if (data.end && (!data.name || data.line === 0) && !this.started) {
                        console.log('[poll] 忽略上一轮的残留状态（end 且未开始）');
                        return this.pollProgress();
                    }

                    this.started = true;
                    console.log('[poll] 本轮任务开始');

                    let msg = '';
                    if (data.name && data.line === 0) {
                        msg = `开始处理文件：${data.name}`;
                    } else if (data.name && data.line > 0) {
                        msg = `正在处理文件：${data.name} ，第 ${data.line} 行`;
                    }

                    // === 防重复显示：使用 name__line 作为 key ===
                    const key = `${data.name}__${data.line}`;
                    if (msg && !this.messageSet.has(key)) {
                        console.log('[poll] 渲染提示:', msg);
                        this.messageSet.add(key);
                        this.$refs.result_text.classList.remove('d-none');
                        this.$refs.result_text.insertAdjacentHTML('beforeend', `<p>${msg}</p>`);
                        this.$refs.result_text.scrollTop = this.$refs.result_text.scrollHeight;
                    } else {
                        console.log('[poll] 提示跳过（重复或空）:', msg);
                    }

                    if (data.end && data.name) {
                        const endMsg = '全部执行完毕';
                        if (!this.messageSet.has('end')) {
                            this.messageSet.add('end');
                            this.$refs.result_text.insertAdjacentHTML('beforeend', `<p>${endMsg}</p>`);
                        }
                        clearTimeout(this.timeid);
                        this.timeid = null;
                        this.$refs.start_button.disabled = false;
                        this.$refs.tips.innerText = '';
                        this.$refs.startRecord.disabled = false;
                        this.$refs.upload.disabled = false;
                    } else {
                        this.timeid = setTimeout(() => this.pollProgress(), 3000);
                    }
                })
                .catch((err) => {
                    console.warn('[poll] 异常', err);
                    this.timeid = setTimeout(() => this.pollProgress(), 3000);
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
            this.user_id = '1';
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
</style>
