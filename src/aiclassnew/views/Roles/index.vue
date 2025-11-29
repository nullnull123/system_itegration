<template>
  <div class="roles-layout">
    <!-- 背景层 - 虚化效果 (只覆盖内容区域) -->
    <div class="background-blur"></div>
    
    <div class="roles-header">
      <h1 class="page-title">
        <i class="el-icon-user"></i>
        个人中心
      </h1>
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">系统首页</el-breadcrumb-item>
          <el-breadcrumb-item>角色详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    
    <!-- 内容区域 - 确保内容在背景之上 -->
    <div class="roles-content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'RolesLayout',
  data() {
    return {
      roleValid: null,  // null 表示验证中
      userData: null,
      requiredRole: null,
      debugMode: true  // 开发环境设为 true，生产环境应设为 false
    };
  },
  async created() {
    await this.initialize();
  },
  methods: {
    async initialize() {
      try {
        // 1. 获取用户数据
        const userDataJson = localStorage.getItem('user_data');
        if (userDataJson) {
          this.userData = JSON.parse(userDataJson);
        } else {
          throw new Error('用户数据未找到');
        }
        
        // 2. 获取所需角色
        this.requiredRole = this.getRequiredRoleForRoute();
        
        // 3. 验证角色
        if (this.requiredRole && this.userData.role) {
          this.roleValid = this.userData.role === this.requiredRole;
          
          if (!this.roleValid) {
            console.warn(`[RolesLayout] 角色不匹配: 需要 ${this.requiredRole}，当前为 ${this.userData.role}`);
          } else {
            console.log(`[RolesLayout] 角色验证通过: ${this.userData.role} === ${this.requiredRole}`);
          }
        } else {
          this.roleValid = true;
        }
      } catch (error) {
        console.error('[RolesLayout] 初始化失败:', error);
        this.roleValid = false;
      }
    },
    
    getRequiredRoleForRoute() {
      const roleRoutes = {
        'SystemAdminDetail': 'system_admin',
        'SchoolDetail': 'school',
        'CollegeDetail': 'college',
        'CourseGroupDetail': 'course_group',
        'TeacherDetail': 'teacher',
        'StudentDetail': 'student'
      };
      
      return roleRoutes[this.$route.name];
    }
  }
};
</script>

<style scoped>
/* 背景层样式 - 只覆盖内容区域 */
.roles-layout {
  position: relative;
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
  z-index: 1;
}

/* 背景层只覆盖.roles-layout容器内部 */
.background-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/aiclass/picture/2.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(8px);
  z-index: -1; /* 背景在内容之下，但在.roles-layout背景之上 */
  border-radius: 12px; /* 与内容区域相同的圆角 */
}

/* 添加半透明遮罩层，提高内容可读性 */
.background-blur::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  z-index: -1;
}

.roles-header {
  margin-bottom: 25px;
  position: relative;
  z-index: 2; /* 确保标题在背景之上 */
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.breadcrumb {
  padding: 10px 0;
}

.roles-content {
  position: relative;
  z-index: 2; /* 确保内容在背景之上 */
  background: white;
  border-radius: 12px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 400px;
  padding: 20px;
  background-color: transparent; /* 透明背景，显示背景图 */
}
</style>