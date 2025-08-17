<template>
  <div class="default-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu 
          :default-active="$route.path" 
          class="sidebar-menu"
          router
        >
          <div class="logo">
            <h1>AI Class Workshop</h1>
          </div>
          
          <el-menu-item index="/smart-prep/upload">
            <i class="el-icon-document"></i>
            <span>智能备课</span>
          </el-menu-item>
          
          <el-menu-item index="/note-completion/upload">
            <i class="el-icon-notebook-2"></i>
            <span>笔记补全</span>
          </el-menu-item>
          
          <el-menu-item index="/exercise-assessment/list">
            <i class="el-icon-tickets"></i>
            <span>习题测评</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-content">
            <h2>{{ pageTitle }}</h2>
            <div class="user-info">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{ currentUser ? currentUser.username : '用户' }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  computed: {
    pageTitle() {
      return this.$route.meta.title || 'AI Class Workshop'
    },
    currentUser() {
      return this.$store.state.user
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.$store.dispatch('logout')
        this.$router.push('/auth/login')
      }
    }
  }
}
</script>

<style scoped>
.default-layout {
  height: 100vh;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
}

.logo h1 {
  font-size: 16px;
  margin: 0;
  color: #409EFF;
  font-weight: bold;
}

.el-header {
  padding: 0;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
</style>