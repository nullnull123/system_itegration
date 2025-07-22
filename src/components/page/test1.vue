<template>
  <div class="container">
    <div class="left-box">
      123
    </div>
    <div class="right-box">
      456
    </div>
  </div>
</template>

<script>
export default {
  name: 'TwoColumnLayout'
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh; /* 使容器占据整个视口高度 */
}

.left-box, .right-box {
  flex: 1; /* 两个盒子平分可用空间 */
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  font-size: 24px;
  border: 1px solid #ccc; /* 可选：添加边框 */
  padding: 20px;
  box-sizing: border-box;
}

.left-box {
  background-color: #f0f0f0; /* 可选：左侧背景色 */
}

.right-box {
  background-color: #e0e0e0; /* 可选：右侧背景色 */
}
</style>