<!-- src/components/common/AIWorkshopLogin.vue -->
<template>
  <div class="login-container">
    <!-- 背景图片（虚化处理） -->
    <div class="login-background">
      <img src="@/aiclass/picture/1.jpg" alt="智课工坊背景">
      <div class="background-overlay"></div>
    </div>
    
    <!-- 登录表单 -->
    <div class="login-form-container">
      <div class="login-form">
        <div class="logo-section">
          <div class="logo-circle">
            <i class="el-icon-lx-remind"></i>
          </div>
          <h2 class="login-title">智课工坊登录</h2>
        </div>
        
        <!-- 添加登出成功提示 -->
        <div v-if="loggedOut" class="logout-message">
          <el-alert
            title="已安全退出"
            type="success"
            description="请使用您的账户信息重新登录"
            show-icon
            :closable="false">
          </el-alert>
        </div>
        
        <el-form :model="loginForm" @submit.native.prevent="handleSubmit">
          <el-form-item label="用户名">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              @keyup.enter.native="handleSubmit"
            ></el-input>
          </el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="loading" 
            class="login-button"
            size="medium"
          >
            <i class="el-icon-position" v-if="loading"></i> 登录
          </el-button>
        </el-form>
        
        <div class="login-footer">
          <p>© 智课工坊 | 专业教学辅助平台</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false,
      loggedOut: false
    };
  },
  created() {
    // 1. 优先处理登出请求
    if (this.$route.query.loggedOut === 'true') {
      this.loggedOut = true;
      localStorage.removeItem('ai_class_workshop_token');
      localStorage.removeItem('user_data');
      return;
    }
    
    // 2. 已登录自动跳转
    if (localStorage.getItem('ai_class_workshop_token')) {
      // 尝试从localStorage获取用户信息
      const userDataJson = localStorage.getItem('user_data');
      let redirectPath = '/SmartPrep'; // 默认路径
      
      if (userDataJson) {
        try {
          const userData = JSON.parse(userDataJson);
          // 根据用户角色确定重定向路径
          redirectPath = this.getRoleRedirectPath(userData.role);
        } catch (e) {
          console.error('[登录] 解析用户数据失败:', e);
        }
      }
      
      this.$router.push(redirectPath);
    }
  },
  methods: {
    getCSRFToken() {
      // 从cookie获取
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      
      // 或从meta标签获取
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      return cookieValue || (metaTag ? metaTag.getAttribute('content') : '');
    },
    
    /**
     * 根据用户角色获取对应的重定向路径
     */
    getRoleRedirectPath(role) {
      const roleRoutes = {
        'system_admin': '/Roles/systemadmindetail',
        'school': '/Roles/schooldetail',
        'college': '/Roles/collegedetail',
        'course_group': '/Roles/coursegroupdetail',
        'teacher': '/Roles/teacherdetail',
        'student': '/Roles/studentdetail'
      };
      
      // 关键修复：强制确保返回正确的角色路径
      const redirectPath = roleRoutes[role];
      
      if (!redirectPath) {
        console.warn(`[登录] 未知角色: ${role}，使用默认路径`);
        return '/SmartPrep';
      }
      
      console.log(`[登录] 角色(${role})映射到路径: ${redirectPath}`);
      return redirectPath;
    },
    
    async fetchCurrentUser(token) {
      console.log('[登录] 正在获取用户信息...');
      try {
        const response = await fetch('/ai_class_workshop/api/v1/users/users/me/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCSRFToken() || '',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin'
        });
        
        console.log('[登录] 用户信息响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[登录] 获取用户信息失败:', errorData);
          throw new Error(`获取用户信息失败: ${response.status} ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('[登录] 获取到的完整用户信息:', userData);
        
        // 存储完整用户信息
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // 设置全局角色标识（用于Sidebar）
        if (window.$global) {
          window.$global.isStu = (userData.role === 'student');
        } else if (this.$root && this.$root.$global) {
          this.$root.$global.isStu = (userData.role === 'student');
        }
        
        return userData;
      } catch (error) {
        console.error('[登录] 用户信息获取异常:', error);
        throw new Error('登录成功但无法获取用户信息，请重试');
      }
    },
    
    async handleSubmit() {
      this.loading = true;
      try {
        console.log('[登录] 开始处理登录请求');
        console.log('[登录] 用户名:', this.loginForm.username);
        // 掩码密码用于日志
        const maskedPassword = this.loginForm.password ? '*'.repeat(this.loginForm.password.length) : '';
        console.log('[登录] 密码:', maskedPassword);
        
        // 获取CSRF token
        const csrfToken = this.getCSRFToken();
        console.log('[登录] 获取到的CSRF Token:', csrfToken ? '存在' : '不存在');
        
        // 构建请求体
        const requestData = {
          username: this.loginForm.username,
          password: this.loginForm.password
        };
        console.log('[登录] 请求数据:', requestData);
        
        // 发送登录请求
        const response = await fetch('/ai_class_workshop/api/token/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken || ''  // 即使没有token也发送空值
          },
          body: JSON.stringify(requestData),
          credentials: 'same-origin'  // 确保发送cookies
        });
        
        console.log('[登录] 响应状态:', response.status, response.statusText);
        
        // 记录响应头
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log('[登录] 响应头:', headers);
        
        // 处理401未授权
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[登录] 401未授权:', errorData);
          throw new Error('用户名或密码错误，请重试');
        }
        
        // 处理500服务器错误
        if (!response.ok) {
          console.error(`[登录] 服务器返回错误状态: ${response.status} ${response.statusText}`);
          
          let errorMessage = `登录失败: ${response.status} ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.non_field_errors) {
              errorMessage = errorData.non_field_errors.join(', ');
            }
          } catch (e) {
            console.log('[登录] 无法解析错误响应体');
          }
          
          throw new Error(errorMessage);
        }
        
        // 解析成功响应
        const data = await response.json();
        console.log('[登录] 登录响应数据:', data);
        
        // 检查token是否存在
        if (!data.token) {
          console.error('[登录] 响应中缺少token字段', data);
          throw new Error('服务器响应格式错误，缺少token');
        }
        
        // 存储token
        localStorage.setItem('ai_class_workshop_token', data.token);
        console.log('[登录] Token已存储到localStorage');
        console.log(data.token);
        
        // ===== 关键步骤：获取完整用户信息 =====
        const userData = await this.fetchCurrentUser(data.token);
        
        // ===== 修复：强制使用角色详情页面作为重定向路径 =====
        let redirectPath;
        
        // 优先使用角色详情页面
        redirectPath = this.getRoleRedirectPath(userData.role);
        
        // 检查重定向路径是否存在
        const resolved = this.$router.resolve(redirectPath);
        if (!resolved.route.matched.length) {
          console.warn('[登录] 无效的角色详情路径，使用SmartPrep作为备用', redirectPath);
          redirectPath = '/SmartPrep';
        }
        
        console.log(`[登录] 登录成功，跳转到: ${redirectPath}`);
        
        // 1. 存储userData到sessionStorage (关键修改)
        sessionStorage.setItem('login_user_data', JSON.stringify(userData));

        // 2. 跳转时添加fromLogin标识 (保留原有query参数)
        this.$router.push({
          path: redirectPath,
          query: {
            ...this.$route.query,
            fromLogin: 'true'  // 标识来自登录跳转
          }
        });
        this.$global.isStu = true;
        
      } catch (error) {
        console.error('[登录] 完整错误信息:', error);
        
        // 清除可能残留的token
        localStorage.removeItem('ai_class_workshop_token');
        localStorage.removeItem('user_data');
        
        // 特殊处理网络错误
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          this.$message.error('无法连接到服务器，请检查网络连接');
        } 
        // 特殊处理500错误
        else if (error.message.includes('500')) {
          this.$message.error('服务器内部错误，请稍后重试或联系管理员');
        } 
        // 用户信息获取失败
        else if (error.message.includes('无法获取用户信息')) {
          this.$message.error('登录成功但无法获取用户信息，请重试');
        }
        // 其他错误
        else {
          this.$message.error(error.message || '登录失败，请重试');
        }
        
      } finally {
        this.loading = false;
        console.log('[登录] 登录请求处理完成');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  overflow: hidden;
}

.login-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(5px); /* 虚化处理 */
  transform: scale(1.1); /* 确保覆盖整个区域 */
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55); /* 半透明遮罩，提高文字可读性 */
}

.login-form-container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.login-form {
  width: 420px;
  padding: 40px 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.login-form:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #409EFF, #66B2FF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 32px;
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

.login-title {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.logout-message {
  margin-bottom: 25px;
  border-radius: 8px;
  overflow: hidden;
}

.el-form-item {
  margin-bottom: 22px;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #999;
  font-size: 13px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    padding: 30px 20px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-form {
  animation: fadeIn 0.5s ease forwards;
}
</style>