<template>
  <div class="user-center">
    <!-- 顶部用户信息卡片 -->
    <el-card class="user-info-card">
      <el-row type="flex" align="middle">
        <!-- 用户头像 -->
        <el-col :span="2">
          <div class="avatar">
            <img :src="avatarUrl" alt="用户头像" class="avatar-image">
          </div>
        </el-col>
        <!-- 用户信息 -->
        <el-col :span="12" class="user-details">
          <div class="name">{{ name }}</div>
          <div class="age-education">
            <span>{{ age }}岁</span> |
            <span>{{ educationLevel }}</span> |
            <span>{{ graduationYear }}届</span>
          </div>
        </el-col>
        <!-- 期望职位和专业 -->
        <el-col :span="12" class="expectation-university">
          <div class="expectation">
            期望：{{ jobExpectation }}
          </div>
          <div class="university">
            {{ university }} · {{ major }}
          </div>
          <el-button class="edit-button" type="primary" @click="goToProfile">
            修改简历
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 用户统计信息卡片 -->
    <el-card class="stats-card" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-button
            class="stats-btn"
            type="text"
            v-for="item in stats"
            :key="item.label"
            @click="changeCardContent(item.label)"
          >
            <span class="stat-title">{{ item.label }}</span>
            <span class="stat-number">({{ item.count }})</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 动态内容区域 -->
    <div class="dynamic-content" v-if="currentSelected">
      <p>显示 {{ currentSelected }} 相关的内容...</p>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    document.title = '个人中心';
  },
  data() {
    return {
      // 用户信息数据
      name: '用户名',
      age: '24',
      educationLevel: '硕士',
      graduationYear: '27',
      jobExpectation: '前端开发',
      university: '西安电子科技大学',
      major: '计算机技术',
      avatarUrl: require('../assets/logo.png'),
      stats: [
        { label: '沟通过', count: 0 },
        { label: '已投递', count: 0 },
        { label: '面试', count: 0 },
        { label: '感兴趣', count: 0 },
      ],
      currentSelected: null, // 用于记录当前选中的统计项
    };
  },
  methods: {
    goToProfile() {
      this.$router.push({ path: '/profile' });
    },
    changeCardContent(label) {
      this.currentSelected = label;
      // 这里可以添加更多的逻辑来根据当前选中的统计项显示不同的内容
    },
  },
};
</script>

<style lang="less" scoped>
.user-center {
  padding: 20px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.user-info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-image {
  width: 50px; /* 固定宽度 */
  height: 50px;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px; /* 左侧间距 */
}

.user-details .name {
  color: #000;
  font-size: 20px;
  font-weight: bold;
  margin-left: 50px;
}

.user-details .age-education {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
  margin-left: 50px;
}

.expectation-university {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 200px;
  margin-top: 15px;
}

.expectation-university .expectation {
  color: #000;
  font-size: 14px;
  margin-bottom: 10px; /* 与专业信息间隔 */
  margin-top: -10px;
}

.expectation-university .university {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
  white-space: nowrap;
}

.edit-button {
  position: absolute;
  white-space: nowrap;
  margin-left: 400px;
  margin-bottom: 10px;
}

.stats-info-card {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  padding: 10px;
  border-radius: 5px;
  background-color: #f5f5f5;
  margin-bottom: 10px;
  text-align: center;
}

.stat-title {
  font-size: 16px;
  color: #333;
}

.stat-number {
  font-size: 20px;
  color: #666;
  font-weight: bold;
}
.stats-card {
  padding: 5px;
}

.stats-btn {
  margin-right: 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.stats-btn:hover,
.stats-btn:focus {
  color: #00a6a7;
}

.stats-btn:hover .stat-title,
.stats-btn:focus .stat-title {
  color: #00a6a7;
}

.stats-btn:hover .stat-number,
.stats-btn:focus .stat-number {
  color: #00a6a7;
}

.stat-title {
  margin-right: 5px;
}

.stat-number {
  font-weight: normal;
}

.dynamic-content {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>