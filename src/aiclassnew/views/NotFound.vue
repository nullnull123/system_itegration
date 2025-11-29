<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>页面不存在</h2>
    <p>您访问的页面不存在或已被删除。</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage'
}
</script>

<style scoped>
.not-found {
  max-width: 600px;
  margin: 50px auto;
  text-align: center;
  padding: 20px;
}

.not-found h1 {
  font-size: 72px;
  color: #909399;
  margin: 0;
}

.not-found h2 {
  font-size: 24px;
  color: #333;
  margin: 10px 0;
}

.not-found p {
  color: #666;
  margin-bottom: 30px;
}
</style>