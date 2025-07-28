import request from '@/api/request'  // 直接复用 job 模块的 axios 封装

export function getAudioList() {  // 获取可用的音频文件列表
  return request.get('/init')
}

export function getLanguageList() {  //  获取支持的语音语言列表
  return request.get('/get_languages')
}

export function getModelStatus() {  //  获取后端模型是否已启动的状态
  return request.get('/isstart')
}
