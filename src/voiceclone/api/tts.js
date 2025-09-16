import axios from 'axios'

/* ========= 基础路径 ========= */
const BASE_URL = process.env.VUE_APP_BASE_API + '/voiceclone/'

/* ========= 模型与配置 ========= */
export const getModelStatus = () => axios.get(`${BASE_URL}isstart/`)
export const getLanguageList = () => axios.get(`${BASE_URL}get_languages/`)
export const getVoiceListExt = () => axios.get(`${BASE_URL}voice_list_ext/`)
export const getTTSConfig = () => axios.get(`${BASE_URL}tts_config/`)
export const getTXTConfig = () => axios.get(`${BASE_URL}txt_config/`)
export const toggleModelStatus = data => axios.post(`${BASE_URL}onoroff/`, data)
export const checkUpdateStatus = () => axios.get(`${BASE_URL}checkupdate/`)
export const getSTSStatus = () => axios.get(`${BASE_URL}stsstatus/`)

// ====================== 音频与上传 ======================
export const deleteVoice = (name) => {
  const fd = new FormData()
  fd.append('name', name)
  return axios.post(`${BASE_URL}delete_voice/`, fd)
}
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
export const runBatchTTS = data => axios.post(`${BASE_URL}start_tts_batch/`, data)
export const getBatchProgress = (user_id, batch_id) =>
  axios.get(`${BASE_URL}ttslistjindu/`, { params: { user_id, batch_id } })

// ====================== 上传、删除 TXT & 下载 ZIP ======================

// 上传多个 TXT 文件
export const uploadTxtFiles = fd =>
  axios.post(`${BASE_URL}upload_txt/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// 删除单个 TXT
export const deleteTxtFile = (data) =>
  axios.post(`${BASE_URL}delete_txt/`, data);

// 批量删除多个 TXT
export const deleteTxtFiles = (data) =>
  axios.post(`${BASE_URL}delete_txt_batch/`, data);

// 下载打包的 ZIP 音频文件
export const downloadZip = (filenames, user_id, batch_id) =>
  axios.post(`${BASE_URL}download_tts_zip/`, { filenames }, {
    params: { user_id, batch_id }
  });


/* ========= 日志 ========= */
export const writeLog = data => axios.post(`${BASE_URL}log/`, data)