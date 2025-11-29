<template>
  <div class="system-admin-detail-container">
    <!-- 管理员详情部分 -->
    <div class="user-detail-container">
      <div class="user-header">
        <div class="avatar">
          <i class="el-icon-user-solid"></i>
        </div>
        <h1>系统管理员详情</h1>
        <div class="user-tag">
          <el-tag type="danger" effect="dark">系统管理员</el-tag>
        </div>
      </div>

      <el-card v-if="userData" class="user-card">
        <div class="user-basic-info">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ userData.username || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">显示ID</span>
              <span class="info-value">#{{ userData.display_id || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">
                <el-tag :type="userData.is_active ? 'success' : 'info'">
                  {{ userData.is_active ? '活跃' : '非活跃' }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatDate(userData.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后更新</span>
              <span class="info-value">{{ formatDate(userData.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="user-contact-info">
          <h2>联系信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">电子邮箱</span>
              <span class="info-value">{{ userData.email || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="user-account-info">
          <h2>账户信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">初始设置</span>
              <span class="info-value">
                <el-tag :type="userData.needs_initial_setup ? 'warning' : 'success'">
                  {{ userData.needs_initial_setup ? '需要' : '已完成' }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 添加加载状态显示 -->
      <div v-if="loading && !userData" class="loading-container">
        <div class="custom-spinner" style="
          width: 32px;
          height: 32px;
          border: 3px solid #e0e0e0;
          borderTopColor: #409EFF;
          borderRadius: 50%;
          animation: system-admin-rotate 1.2s linear infinite;
          margin: 0 auto;
        "></div>
        <div class="loading-text">加载管理员信息中...</div>
      </div>
      
      <!-- 添加错误处理 -->
      <div v-if="error && !userData" class="error-container">
        <el-alert
          title="加载失败"
          type="error"
          :description="error"
          show-icon>
        </el-alert>
        <el-button type="primary" @click="loadUserData" class="retry-button">
          重试
        </el-button>
      </div>
    </div>
    
    <!-- 用户管理区域 -->
    <management-section 
      title="用户管理" 
      icon="el-icon-user"
      :loading="userLoading"
      :error="userError"
      @retry="loadUsers">
      
      <div class="management-toolbar">
        <el-input 
          v-model="userSearchQuery" 
          placeholder="搜索用户名/ID" 
          style="width: 240px;"
          clearable
          @keyup.enter.native="searchUsers">
          <el-button slot="append" icon="el-icon-search" @click="searchUsers"></el-button>
        </el-input>
      </div>
      
      <el-table :data="users" border stripe>
        <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="role" label="角色">
          <template slot-scope="{row}">
            <el-tag :type="getRoleType(row.role)">{{ getRoleDisplay(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="school_name" label="学校"></el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="{row}">
            <el-button size="mini" @click="viewUserDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        class="pagination"
        @current-change="handleUserPageChange"
        :current-page="userPagination.page"
        :page-size="userPagination.pageSize"
        :total="userPagination.total"
        layout="total, prev, pager, next, jumper">
      </el-pagination>
    </management-section>
    
    <!-- 学校管理区域 -->
    <management-section 
      title="学校管理" 
      icon="el-icon-office-building"
      :loading="schoolLoading"
      :error="schoolError"
      @retry="loadSchools">
      
      <div class="management-toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateSchoolDialog = true">
          创建学校
        </el-button>
      </div>
      
      <el-table :data="schools" border stripe>
        <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
        <el-table-column prop="name" label="学校名称"></el-table-column>
        <el-table-column prop="user_count" label="用户数" width="100"></el-table-column>
        <el-table-column prop="has_active_users" label="状态" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.has_active_users ? 'success' : 'info'">
              {{ row.has_active_users ? '有用户' : '无用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="{row}">
            <el-button size="mini" @click="viewSchoolDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </management-section>
    
    <!-- 创建学校对话框 -->
    <el-dialog title="创建新学校" :visible.sync="showCreateSchoolDialog" width="400px">
      <el-form :model="newSchoolForm" :rules="schoolRules" ref="schoolForm" label-width="80px">
        <el-form-item label="学校名称" prop="name">
          <el-input v-model="newSchoolForm.name" placeholder="请输入学校名称" maxlength="50" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCreateSchoolDialog">取 消</el-button>
        <el-button type="primary" @click="handleCreateSchool" :loading="createSchoolLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 用户详情对话框 -->
    <el-dialog title="用户详情" :visible.sync="userDetailDialogVisible" width="600px">
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">用户名:</span>
          <span class="detail-value">{{ selectedUser?.username || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">显示ID:</span>
          <span class="detail-value">#{{ selectedUser?.display_id || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">角色:</span>
          <span class="detail-value">
            <el-tag :type="getRoleType(selectedUser?.role)">{{ getRoleDisplay(selectedUser?.role) }}</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">学校:</span>
          <span class="detail-value">{{ selectedUser?.school_name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">电子邮箱:</span>
          <span class="detail-value">{{ selectedUser?.email || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="selectedUser?.is_active ? 'success' : 'info'">
              {{ selectedUser?.is_active ? '活跃' : '非活跃' }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间:</span>
          <span class="detail-value">{{ formatDate(selectedUser?.created_at) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">员工/学号:</span>
          <span class="detail-value">{{ selectedUser?.employee_id || selectedUser?.student_id || 'N/A' }}</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeUserDetail">关闭</el-button>
      </div>
    </el-dialog>
    
    <!-- 学校详情对话框 -->
    <el-dialog title="学校详情" :visible.sync="schoolDetailDialogVisible" width="600px">
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">学校名称:</span>
          <span class="detail-value">{{ selectedSchool?.name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">显示ID:</span>
          <span class="detail-value">#{{ selectedSchool?.display_id || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">用户数:</span>
          <span class="detail-value">{{ selectedSchool?.user_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="selectedSchool?.has_active_users ? 'success' : 'info'">
              {{ selectedSchool?.has_active_users ? '有用户' : '无用户' }}
            </el-tag>
          </span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeSchoolDetail">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SystemAdminDetail',
  components: {
    ManagementSection: {
      props: ['title', 'icon', 'loading', 'error'],
      render(h) {
        return h('el-card', {
          class: 'management-section'
        }, [
          h('div', { class: 'section-header' }, [
            h('h2', [
              h('i', { class: this.icon }),
              ' ',
              this.title
            ]),
            h('div', { class: 'header-actions' }, [
              this.$slots.actions
            ])
          ]),
          this.$slots.default,
          // 替换 el-spin 为纯 CSS 加载器
          this.loading ? h('div', { class: 'loading-overlay' }, [
            h('div', {
              class: 'custom-spinner',
              style: {
                width: '32px',
                height: '32px',
                border: '3px solid #e0e0e0',
                borderTopColor: '#409EFF',
                borderRadius: '50%',
                animation: 'system-admin-rotate 1.2s linear infinite'
              }
            })
          ]) : null,
          this.error ? h('div', { class: 'error-message' }, [
            h('el-alert', {
              props: {
                title: this.error,
                type: 'error',
                showIcon: true
              }
            }),
            h('el-button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => this.$emit('retry')
              }
            }, '点击重试')
          ]) : null
        ])
      }
    }
  },
  data() {
    return {
      userSearchQuery: '',
      userPagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      userDetailDialogVisible: false,
      schoolDetailDialogVisible: false,
      selectedUser: null,
      selectedSchool: null,
      showCreateSchoolDialog: false,
      newSchoolForm: {
        name: ''
      },
      createSchoolLoading: false,
      schoolRules: {
        name: [
          { required: true, message: '请输入学校名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState('roles', ['userData', 'users', 'schools', 'loading', 'userLoading', 'schoolLoading', 'error', 'userError', 'schoolError'])
  },
  created() {
    this.loadUserData();
    this.loadUsers();
    this.loadSchools();
  },
  methods: {
    ...mapActions('roles', ['loadUserData', 'getUsers', 'getSchools', 'createSchool']),
    
    async loadUsers() {
      try {
        const result = await this.getUsers(this.userPagination.page);
        // 修正：添加更严格的验证
        if (result && typeof result.total === 'number') {
          this.userPagination.total = result.total;
        } else {
          console.error('Invalid result from getUsers:', result);
          this.userPagination.total = 0;
        }
      } catch (error) {
        console.error('加载用户列表失败:', error);
        this.userPagination.total = 0;
      }
    },
    
    async loadSchools() {
      try {
        await this.getSchools();
      } catch (error) {
        console.error('加载学校列表失败:', error);
      }
    },
    
    handleUserPageChange(page) {
      this.userPagination.page = page;
      this.loadUsers();
    },
    
    searchUsers() {
      console.log('搜索用户:', this.userSearchQuery);
    },
    
    getRoleType(role) {
      const types = {
        'student': 'info',
        'teacher': 'warning',
        'course_group': 'primary',
        'college': 'success',
        'admin': 'danger'
      }
      return types[role] || 'info'
    },
    
    getRoleDisplay(role) {
      const displayNames = {
        'student': '学生',
        'teacher': '教师',
        'course_group': '课程组管理员',
        'college': '学院管理员',
        'admin': '系统管理员'
      }
      return displayNames[role] || role
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch {
        return '格式错误';
      }
    },
    
    // 查看用户详情并显示弹窗
    viewUserDetail(user) {
      this.selectedUser = user;
      this.userDetailDialogVisible = true;
    },
    
    // 关闭用户详情弹窗
    closeUserDetail() {
      this.userDetailDialogVisible = false;
      this.selectedUser = null;
    },
    
    // 查看学校详情并显示弹窗
    viewSchoolDetail(school) {
      this.selectedSchool = school;
      this.schoolDetailDialogVisible = true;
    },
    
    // 关闭学校详情弹窗
    closeSchoolDetail() {
      this.schoolDetailDialogVisible = false;
      this.selectedSchool = null;
    },
    
    // 关闭创建学校对话框
    closeCreateSchoolDialog() {
      this.showCreateSchoolDialog = false;
      this.newSchoolForm.name = '';
      this.$nextTick(() => {
        if (this.$refs.schoolForm) {
          this.$refs.schoolForm.clearValidate();
        }
      });
    },
    
    // 创建学校
    async handleCreateSchool() {
      try {
        // 表单验证
        await this.$refs.schoolForm.validate();
        
        // 设置加载状态
        this.createSchoolLoading = true;
        
        // 调用创建学校 action
        await this.createSchool(this.newSchoolForm);
        
        // 显示成功消息
        this.$message({
          type: 'success',
          message: '学校创建成功',
          duration: 2000
        });
        
        // 关闭对话框
        this.closeCreateSchoolDialog();
      } catch (error) {
        // 处理验证失败或API错误
        if (error !== true) { // 验证失败时 error 为 true
          this.$message({
            type: 'error',
            message: error.message || '创建学校失败，请重试',
            duration: 3000
          });
        }
      } finally {
        this.createSchoolLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.system-admin-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.user-header {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c, #d64141);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.user-header h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 600;
}

.user-tag {
  margin-top: 8px;
}

.user-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
}

.user-basic-info, 
.user-contact-info, 
.user-account-info {
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-basic-info:last-child,
.user-contact-info:last-child,
.user-account-info:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.user-basic-info h2,
.user-contact-info h2,
.user-account-info h2 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
  min-height: 20px;
}

.management-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  margin: 30px 0;
}

.loading-text {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
}

.error-container {
  max-width: 600px;
  margin: 30px auto;
  text-align: center;
}

.retry-button {
  margin-top: 16px;
  padding: 8px 24px;
  border-radius: 4px;
}

.management-section {
  margin-top: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  text-align: center;
  padding: 20px 0;
}

/* 详情弹窗样式 */
.detail-content {
  padding: 10px 20px;
}

.detail-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  width: 120px;
  font-weight: bold;
  color: #606266;
}

.detail-value {
  flex: 1;
  color: #303133;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .system-admin-detail-container {
    padding: 12px;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
    font-size: 28px;
  }
  
  .management-toolbar {
    flex-direction: column;
  }
  
  .management-toolbar > * {
    margin-bottom: 8px;
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    align-items: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .button-group {
    align-self: flex-end;
  }
  
  /* 详情弹窗响应式调整 */
  .detail-label {
    width: 100px;
    font-size: 14px;
  }
  
  .detail-value {
    font-size: 14px;
  }
}
</style>