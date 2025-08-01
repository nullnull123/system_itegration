import axios from 'axios'

/* ========= 基础路径 ========= */
const BASE_URL = 'http://10.104.52.24:8000/voiceclone/'

/* ========= 模型与配置 ========= */
export const getModelStatus = () => axios.get(`${BASE_URL}isstart/`)
export const getLanguageList = () => axios.get(`${BASE_URL}get_languages/`)
export const getTTSConfig = () => axios.get(`${BASE_URL}tts_config/`)
export const getTXTConfig = () => axios.get(`${BASE_URL}txt_config/`)
export const toggleModelStatus = data => axios.post(`${BASE_URL}onoroff/`, data)
export const checkUpdateStatus = () => axios.get(`${BASE_URL}checkupdate/`)
export const getSTSStatus = () => axios.get(`${BASE_URL}stsstatus/`)

// ====================== 音频与上传 ======================
export const getAudioList = () => axios.get(`${BASE_URL}init/`)
export const uploadAudioFile = fd => axios.post(
  `${BASE_URL}upload/`,
  fd,
  { headers: { 'Content-Type': 'multipart/form-data' } }
)

// ====================== 合成与转换 ======================
export const runTTS = data => axios.post(`${BASE_URL}tts/`, data)
export const runSTS = fd => axios.post(
  `${BASE_URL}sts/`,
  fd,
  { headers: { 'Content-Type': 'multipart/form-data' } }
)
export const runBatchTTS = data => axios.post(`${BASE_URL}ttslist/`, data)
export const getBatchProgress = (user_id = 'guest') =>
  axios.get(`${BASE_URL}ttslistjindu/`, { params: { user_id } })

/* ========= 日志 ========= */
export const writeLog = data => axios.post(`${BASE_URL}log/`, data)