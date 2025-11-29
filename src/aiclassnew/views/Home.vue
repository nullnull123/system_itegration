<!-- src/views/Home.vue -->
<template>
  <div class="home-container">
    <h1 class="home-title">AI Class Workshop</h1>
    <p class="home-subtitle">智能教育平台</p>
    
    <div class="feature-grid">
      <router-link to="/smart-prep" class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-document"></i>
        </div>
        <h3>智能备课</h3>
        <p>上传和优化教案</p>
      </router-link>
      
      <router-link to="/note-completion" class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-notebook-2"></i>
        </div>
        <h3>笔记补全</h3>
        <p>上传和补全学生笔记</p>
      </router-link>
      
      <router-link to="/exercise-assessment" class="feature-card">
        <div class="feature-icon">
          <i class="el-icon-tickets"></i>
        </div>
        <h3>习题测评</h3>
        <p>创建和提交习题</p>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.home-title {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.home-subtitle {
  font-size: 20px;
  color: #666;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.feature-card {
  background: white;
  border-radius: 10px;
  padding: 30px 20px;
  text-decoration: none;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
  font-size: 32px;
}

.feature-icon i {
  font-size: 40px;
}

.feature-card h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #333;
}

.feature-card p {
  color: #666;
  font-size: 16px;
}
</style>