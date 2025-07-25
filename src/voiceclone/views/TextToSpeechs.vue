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
                            <select class="form-select w-auto" id="languageSelect"></select>
                        </div>
                    </div>

                    <div class="col-md-3" style="margin-right: 30px; padding-left: 0px">
                        <label for="audioSelect" class="form-label">要使用的声音文件:<a href="javascript:;"
                                @click="shiting($event)" class="form-text">点击试听</a></label>
                        <select class="form-select" id="audioSelect" style="width: 240px !important"></select>
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
                            <button class="btn btn-sm btn-primary btn-record" id="startRecord">开始录制</button>
                            <button class="btn btn-sm btn-danger btn-record" id="stopRecord" disabled>停止录制</button>
                            <button class="btn btn-sm btn-success btn-record" id="upload" disabled>使用该录音</button>
                        </div>
                        <audio style="width: 280px" class="w-10" id="audioPlayer" controls></audio>
                    </div>
                </div>

                <div class="mt-4">
                    <strong class="text-primary">填写要处理的txt所在目录完整路径(打开文件夹复制地址栏)</strong>
                    <input id="txt_dir" class="form-control"
                        placeholder="这里填写要批量处理的txt所在目录完整路径 (例如：D:\360MoveData\Users\CZY\Desktop\input)" type="text" />
                </div>

                <div class="mt-4">
                    <strong class="text-primary">填写要保存到的文件夹完整路径(打开文件夹复制地址栏)</strong>
                    <input id="txt_out" class="form-control"
                        placeholder="这里填写输出目标文件夹完整路径 (例如：D:\360MoveData\Users\CZY\Desktop\output)" type="text" />
                </div>

                <div class="row mt-4">
                    <div class="col-md-12 text-center position-relative">
                        <button id="start_button" @click="start($event)"
                            class="btn btn-danger btn-start-record">立即开始生成</button>
                    </div>
                    <div class="col-md-12 d-none text-danger text-center" id="tips"></div>
                    <div style="max-height: 300px" class="col-md-12 overflow-auto d-none alert alert-primary"
                        id="result_text"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAudioList, getLanguageList } from '@/voiceclone/api/tts'
import axios from 'axios';

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
            mediaRecorder: null,
            audioChunks: [],
            sec: 0,
            timeid: null,
            mode: 'tts',
            lastmsg: ''
        }
    },
    mounted() {
        this.init();
        this.bindRecordEvents();
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
        shiting() {
            const select = this.$refs.audioSelect;
            if (!select.value) {
                this.$message.warning(this.langlist.lang1);
                return;
            }
            const audio = new Audio(`/static/voicelist/${select.value}`);
            audio.play();
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
            axios.post('/upload', formData)
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
            axios.post('/upload', formData)
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
        init() {
            getAudioList().then(({ data }) => {
                const select = this.$refs.audioSelect;
                select.innerHTML = '';
                data.forEach(it => {
                    const option = document.createElement('option');
                    option.value = it;
                    option.text = it;
                    select.appendChild(option);
                });
            });

            getLanguageList().then(({ data }) => {
                if (data && data.languages) {
                    const select = this.$refs.languageSelect;
                    select.innerHTML = '';
                    data.languages.forEach(lang => {
                        const option = document.createElement('option');
                        option.value = lang.language_code;
                        option.text = lang.language_name;
                        select.appendChild(option);
                    });
                }
            });
        },
        start() {
            axios.get('/check_login')
                .then(({ data: user }) => {
                    // 不再检查 user.logged_in，直接继续
                    const voice = this.$refs.audioSelect.value;
                    const lang = this.$refs.languageSelect.value;
                    const src = this.$refs.txt_dir.value;
                    const dst = this.$refs.txt_out.value;

                    if (!voice) return this.$message.warning(this.langlist.lang10);
                    if (!src) return this.$message.warning('必须填写要批量处理的txt所在目录');
                    if (!dst) return this.$message.warning('必须填写目标目录');

                    this.$refs.tips.classList.remove('d-none');
                    this.$refs.tips.innerText = this.langlist.lang13;
                    this.$refs.start_button.disabled = true;
                    this.$refs.result_text.classList.remove('d-none');
                    this.$refs.result_text.innerHTML = '';

                    axios.post('/ttslist', { voice, src, dst, language: lang, speed: 1.0 })
                        .then(({ data }) => {
                            if (data.code === 1) {
                                this.$refs.start_button.disabled = false;
                                this.$message.error(data.msg);
                                return;
                            }
                            this.pollProgress(user.user_id);  // 继续传入 user_id
                            this.timeid = setInterval(() => {
                                this.sec++;
                                this.$refs.tips.innerText = `${this.langlist.lang13}: ${this.sec}秒`;
                            }, 1000);
                        });
                });
        },
        pollProgress(userId) {
            axios.get('/ttslistjindu')
                .then(({ data }) => {
                    if (data.end) {
                        clearInterval(this.timeid);
                        this.$refs.tips.innerText = '全部执行结束';
                        this.$refs.result_text.innerHTML += '<p>全部执行完毕</p>';
                        axios.post('/txt_log', {
                            action: 'File Generation Success',
                            user_id: userId
                        });
                        this.$refs.start_button.disabled = false;
                    } else {
                        const msg = `${data.name}-${data.line}`;
                        if (msg !== this.lastmsg) {
                            this.lastmsg = msg;
                            this.$refs.result_text.innerHTML += `<p>开始执行文件:${data.name} , 第${data.line}行</p>`;
                        }
                        setTimeout(() => this.pollProgress(userId), 1000);
                    }
                });
        }
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
