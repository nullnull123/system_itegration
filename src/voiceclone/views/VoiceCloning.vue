<template>
    <div class="container mb-2" style="padding: 15px;">
        <div class="alert rounded-0">
            <p class="mb-0 custom-text">用自己的声音或使用任意音色录制一段音频</p>
            <p class="mb-0 custom-text">用于克隆的最佳音频素材时长为 30s-120s, 为确保清晰准确的人声不要有杂音、背景音</p>
        </div>
        <div class="my-2 btn-group">
            <button @click="toggle('tts')" :class="['btn border', mode === 'tts' ? 'btn-primary' : '']"
                style="border-top-left-radius: 8px; border-bottom-left-radius: 8px;">文字 → 语音</button>
            <button @click="toggle('sts')" :class="['btn border', mode === 'sts' ? 'btn-primary' : '']"
                style="border-top-right-radius: 8px; border-bottom-right-radius: 8px;">语音 → 语音</button>
            <span class="question-mark" @click="showGuide(mode)" title="操作指南">
                <i class="fas fa-question-circle"></i>
            </span>
        </div>

        <div class="p-3 shadow bg-white">
            <div v-show="mode === 'tts'">
                <div class="mb-3 d-flex flex-wrap justify-content-between align-items-start">
                    <div style="flex: 0 0 22%; padding-right: 10px; min-width: 220px;">
                        <div class="d-flex align-items-center">
                            <label class="form-label w-auto">使用模型：</label>
                            <select v-model="model" @change="setVoice" class="form-select w-auto">
                                <option value="default">默认</option>
                                <option v-for="m in models" :key="m.name" :value="m.name">{{ m.label }}</option>
                            </select>
                        </div>
                        <div class="d-flex align-items-center mt-3">
                            <label class="form-label w-auto">文本语言：</label>
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
                        <select v-model="voiceFile" class="form-select">
                            <option v-for="file in audioFiles" :key="file" :value="file">{{ file }}</option>
                        </select>
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
                    <span class="btn btn-sm">导入文本文件(srt,txt)</span>
                    <input type="file" accept=".srt,.txt"
                        class="position-absolute start-0 top-0 end-0 bottom-0 opacity-0" @change="uploadSrtFile">
                </label>
                <div class="text-center mt-3">
                    <button @click="startSynthesis" class="btn btn-danger">立即开始生成</button>
                </div>
            </div>

            <div v-show="mode === 'sts'">
                <div class="p-2">
                    <label class="form-label">要克隆的音色:</label>
                    <select v-model="stsVoice" class="form-select w-auto">
                        <option v-for="file in audioFiles" :key="file" :value="file">{{ file }}</option>
                    </select>
                </div>
                <div id="dropaudio" @drop.prevent="handleFileDrop" @dragover.prevent @click="triggerFileInput"
                    class="border m-2 p-5 text-center" style="cursor: pointer;">
                    拖拽或点击将音频 wav/mp3/flac 文件上传
                </div>
                <input type="file" accept=".mp3,.wav,.flac" ref="stsFileInput" class="d-none"
                    @change="handleFileChange" />
                <div class="text-center mt-3">
                    <button @click="startSTS" class="btn btn-danger">立即开始转换</button>
                </div>
            </div>
        </div>

        <div class="text-danger text-center my-2" v-if="warningMessage">{{ warningMessage }}</div>
        <div class="text-danger text-center my-2" v-if="tipsMessage">{{ tipsMessage }}</div>
        <div class="text-center my-4">
            <audio ref="resultAudio" controls class="d-none"></audio>
        </div>
    </div>
</template>

<script>
import { getAudioList, getLanguageList, getModelStatus } from '@/voiceclone/api/tts'
import axios from 'axios'

export default {
    name: 'TTS',
    data() {
        return {
            mode: 'tts',
            model: 'default',
            models: [],
            language: '',
            languageList: [],
            speed: 1.0,
            voiceFile: '',
            audioFiles: [],
            isRecording: false,
            recorded: false,
            textInput: '',
            stsVoice: '',
            mediaRecorder: null,
            audioChunks: [],
            synthesisTimer: null,
            synthesisSeconds: 0,
            recordSeconds: 0,
            recordTimer: null,
            warningMessage: '',
            tipsMessage: '',
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
    mounted() {
        this.initAudioList();
        this.initLanguageList();
        this.checkModelStatus();
    },
    methods: {
        toggle(type) {
            this.mode = type;
        },
        showGuide(type) {
            const images = {
                tts: '/static/images/guide1.png',
                sts: '/static/images/guide2.png'
            };

            this.$alert(
                `<div style="text-align:center;"><img src="${images[type]}" style="max-width: 100%; height: auto;"></div>`,
                '操作指南',
                { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
            );
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
        async updateModelStatus(modelName, el) {
            try {
                const newStatus = el.status === 'on' ? 'off' : 'on';
                const res = await axios.post('/onoroff', { status_new: newStatus, name: modelName });
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
        playSelectedVoice() {
            if (!this.voiceFile) {
                this.$alert(this.langlist['lang1'], '提示');
                return;
            }
            const audio = new Audio(`/static/audiofile/${this.voiceFile}`);
            audio.play().catch(() => {
                this.$message.error('音频播放失败');
            });
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
                this.$message.success(this.langlist['lang3']);
            }
        },
        async uploadRecording() {
            if (!this.recordedBlob) {
                this.$alert(this.langlist['lang6'], '提示');
                return;
            }
            const formData = new FormData();
            formData.append('audio', this.recordedBlob, 'recorded_audio.wav');
            try {
                const res = await axios.post('/upload', formData);
                if (res.data && res.data.code === 0) {
                    this.$message.success('录音上传成功');
                    await this.initAudioList();
                    this.voiceFile = res.data.data;
                    this.recorded = false;
                } else {
                    this.$message.error(res.data.msg || '上传失败');
                }
            } catch {
                this.$message.error('上传请求失败');
            }
        },
        uploadFromLocal(event) {
            const file = event.target.files[0];
            if (!file) {
                this.$alert(this.langlist['lang7'], '提示');
                return;
            }
            const formData = new FormData();
            formData.append('audio', file);
            axios.post('/upload', formData).then(res => {
                if (res.data && res.data.code === 0) {
                    this.$message.success('上传成功');
                    this.initAudioList();
                    this.voiceFile = res.data.data;
                } else {
                    this.$message.error(res.data.msg || '上传失败');
                }
            }).catch(() => {
                this.$message.error('上传请求失败');
            });
        },
        async startSynthesis() {
            if (!this.voiceFile) {
                this.$alert(this.langlist['lang10'], '提示');
                return;
            }
            if (!this.textInput) {
                this.$alert(this.langlist['lang11'], '提示');
                return;
            }
            if (this.speed < 0.1 || this.speed > 2.0) {
                this.$alert(this.langlist['lang16'], '提示');
                return;
            }
            const payload = {
                voice: this.voiceFile,
                model: this.model,
                text: this.textInput,
                language: this.language,
                speed: this.speed
            };
            this.$message.info(this.langlist['lang13']);
            this.synthesisSeconds = 0;
            this.synthesisTimer = setInterval(() => {
                this.synthesisSeconds++;
                this.$message.info(`合成中：${this.synthesisSeconds} 秒`);
            }, 1000);
            try {
                const res = await axios.post('/tts', payload);
                clearInterval(this.synthesisTimer);
                if (res.data && res.data.code === 0) {
                    this.$message.success('合成成功');
                    this.$refs.resultAudio.src = `/static/ttslist/${res.data.name}`;
                    this.$refs.resultAudio.classList.remove('d-none');
                } else {
                    this.$message.error(res.data.msg || '合成失败');
                }
            } catch {
                clearInterval(this.synthesisTimer);
                this.$message.error('合成请求失败');
            }
        },
        async startSTS() {
            if (!this.stsVoice) {
                this.$alert(this.langlist['lang12'], '提示');
                return;
            }
            try {
                const res = await axios.post('/sts', { voice: this.stsVoice, name: this.stsVoice });
                if (res.data && res.data.code === 0) {
                    this.$message.success('声音转声音成功');
                    this.$refs.resultAudio.src = `/static/ttslist/${res.data.name}`;
                    this.$refs.resultAudio.classList.remove('d-none');
                } else {
                    this.$message.error(res.data.msg || '转换失败');
                }
            } catch {
                this.$message.error('转换请求失败');
            }
        },
        handleFileDrop(event) {
            const file = event.dataTransfer.files[0];
            if (!file) {
                this.$alert(this.langlist['lang5'], '提示');
                return;
            }
            const formData = new FormData();
            formData.append('audio', file);
            formData.append('save_dir', 'tmp');
            axios.post('/upload', formData).then(res => {
                if (res.data && res.data.code === 0) {
                    this.$message.success('上传成功');
                    this.stsVoice = res.data.data;
                } else {
                    this.$message.error(res.data.msg || '上传失败');
                }
            }).catch(() => {
                this.$message.error('上传请求失败');
            });
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
        async initAudioList() {
            try {
                const res = await getAudioList();
                this.audioFiles = res.data || [];
            } catch {
                this.$message.error('获取音频列表失败');
            }
        },
        async initLanguageList() {
            try {
                const res = await getLanguageList();
                this.languageList = res.data.languages || [];
            } catch {
                this.$message.error('获取语言列表失败');
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
        }
    }
};
</script>


<style scoped>
.custom-text {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.7px;
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

.form-label {
    font-size: 1.1rem;
    font-weight: bold;
    color: #0d6efd;
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

.form-select {
    height: calc(2.5rem + 2px);
}
</style>