<template>
  <div class="course-group-detail-container">
    <!-- 课程组用户详情部分 -->
    <div class="user-detail-container">
      <div class="user-header">
        <div class="avatar">
          <i class="el-icon-collection"></i>
        </div>
        <h1>课程组用户详情</h1>
        <div class="user-tag">
          <el-tag type="primary" effect="dark">课程组用户</el-tag>
        </div>
      </div>

      <el-card v-if="displayUserData" class="user-card">
        <div class="user-basic-info">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ displayUserData.username || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">显示ID</span>
              <span class="info-value">#{{ displayUserData.display_id || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">
                <el-tag :type="displayUserData.is_active ? 'success' : 'info'">
                  {{ displayUserData.is_active ? '活跃' : '非活跃' }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatDate(displayUserData.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后更新</span>
              <span class="info-value">{{ formatDate(displayUserData.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="user-organization-info">
          <h2>组织信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">所属学校</span>
              <span class="info-value">{{ displayUserData.school_name || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属学院</span>
              <span class="info-value">{{ displayUserData.college_name || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属课程组</span>
              <span class="info-value">{{ displayUserData.course_group_name || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="user-contact-info">
          <h2>联系信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">电子邮箱</span>
              <span class="info-value">{{ displayUserData.email || '未设置' }}</span>
            </div>
          </div>
        </div>

        <div class="user-account-info">
          <h2>账户信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">初始设置</span>
              <span class="info-value">
                <el-tag :type="displayUserData.needs_initial_setup ? 'warning' : 'success'">
                  {{ displayUserData.needs_initial_setup ? '需要' : '已完成' }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </el-card>
      
      <!-- 添加加载状态显示 -->
      <div v-if="loading && !displayUserData" class="loading-container">
        <div class="custom-spinner" style="
          width: 32px;
          height: 32px;
          border: 3px solid #e0e0e0;
          borderTopColor: #409EFF;
          borderRadius: 50%;
          animation: system-admin-rotate 1.2s linear infinite;
          margin: 0 auto;
        "></div>
        <div class="loading-text">加载课程组信息中...</div>
      </div>
      
      <!-- 添加错误处理 -->
      <div v-if="error && !displayUserData" class="error-container">
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
    
    <!-- 课程详情区域 -->
    <management-section 
      title="课程详情" 
      icon="el-icon-notebook-2"
      :loading="false"
      :error="null">
      
      <div class="course-detail-container">
        <p>当前课程组关联的课程详情：</p>
        <el-button 
          type="primary" 
          icon="el-icon-document" 
          @click="viewCourseDetail">
          查看课程详情
        </el-button>
      </div>
    </management-section>
    
    <!-- 教师管理区域 -->
    <management-section 
      title="教师管理" 
      icon="el-icon-user-solid"
      :loading="teacherLoading"
      :error="teacherError"
      @retry="loadTeachers">
      
      <el-table :data="teachers" border stripe>
        <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="电子邮箱"></el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template slot-scope="{row}">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="{row}">
            <el-button size="mini" @click="viewTeacherDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        class="pagination"
        @current-change="handleTeacherPageChange"
        :current-page="teacherPagination.page"
        :page-size="teacherPagination.pageSize"
        :total="teacherPagination.total"
        layout="total, prev, pager, next, jumper">
      </el-pagination>
    </management-section>
    
    <!-- 教师详情对话框 -->
    <el-dialog title="教师详情" :visible.sync="teacherDetailDialogVisible" width="600px">
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">用户名:</span>
          <span class="detail-value">{{ selectedTeacher?.username || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">显示ID:</span>
          <span class="detail-value">#{{ selectedTeacher?.display_id || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">电子邮箱:</span>
          <span class="detail-value">{{ selectedTeacher?.email || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="selectedTeacher?.is_active ? 'success' : 'info'">
              {{ selectedTeacher?.is_active ? '活跃' : '非活跃' }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间:</span>
          <span class="detail-value">{{ formatDate(selectedTeacher?.created_at) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">最后更新:</span>
          <span class="detail-value">{{ formatDate(selectedTeacher?.updated_at) }}</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeTeacherDetail">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'CourseGroupDetail',
  
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
  
  computed: {
    ...mapState('roles', ['userData', 'teachers', 'teacherLoading', 'teacherError']),
    ...mapGetters('roles', ['isCourseGroupUser']),
    
    // 创建一个新的计算属性用于显示，避免直接修改userData
    displayUserData() {
      // 优先使用从sessionStorage获取的登录用户数据
      return this.loginUserData || this.userData;
    }
  },
  
  data() {
    return {
      error: null,
      loading: true,
      loginUserData: null, // 存储从sessionStorage获取的登录用户数据
      
      // 教师管理相关
      teacherPagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      selectedTeacher: null,
      teacherDetailDialogVisible: false
    };
  },
  
  created() {
    // 1. 优先从sessionStorage获取登录用户数据
    this.loginUserData = this._parseLoginUserData();
    
    // 2. 如果sessionStorage中有数据，直接使用
    if (this.loginUserData) {
      console.log('[CourseGroupDetail] 使用sessionStorage中的登录用户数据');
      this.loading = false;
    } else {
      // 3. 如果没有，再从store中加载
      console.log('[CourseGroupDetail] 从store中加载用户数据');
      this.loadUserData();
    }
    
    this.loadTeachers();
  },
  
  methods: {
    ...mapActions('roles', [
      'loadUserData', 
      'getTeachers'
    ]),
    
    // 解析sessionStorage中的登录用户数据
    _parseLoginUserData() {
      try {
        const loginUserDataStr = sessionStorage.getItem('login_user_data');
        if (loginUserDataStr) {
          const loginUserData = JSON.parse(loginUserDataStr);
          
          // 确保数据结构符合预期
          if (loginUserData && loginUserData.role === 'course_group') {
            console.log('[CourseGroupDetail] 从sessionStorage获取到登录用户数据:', loginUserData);
            return loginUserData;
          }
        }
      } catch (e) {
        console.error('[CourseGroupDetail] 解析sessionStorage中的login_user_data失败:', e);
      }
      return null;
    },
    
    async loadTeachers() {
      try {
        const result = await this.getTeachers(this.teacherPagination.page);
        if (result && typeof result.total === 'number') {
          this.teacherPagination.total = result.total;
        } else {
          console.error('Invalid result from getTeachers:', result);
          this.teacherPagination.total = 0;
        }
      } catch (error) {
        console.error('[CourseGroupDetail] 获取教师列表失败:', error);
        this.teacherError = error.message || '获取教师列表失败';
      }
    },
    
    handleTeacherPageChange(page) {
      this.teacherPagination.page = page;
      this.loadTeachers();
    },
    
    viewTeacherDetail(teacher) {
      this.selectedTeacher = teacher;
      this.teacherDetailDialogVisible = true;
    },
    
    closeTeacherDetail() {
      this.teacherDetailDialogVisible = false;
      this.selectedTeacher = null;
    },
    
    viewCourseDetail() {
      // 跳转到课程详情页面
      // 假设课程组与课程的display_id是相同的
      const courseDisplayId = this.displayUserData.course_group_display_id || this.displayUserData.course_group?.display_id;
      
      if (courseDisplayId) {
        this.$router.push({
          name: 'CourseDetail',
          params: { displayId: courseDisplayId }
        });
      } else {
        this.$message.error('无法获取课程ID');
      }
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
    }
  }
};
</script>

<style scoped>
.course-group-detail-container {
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
  background: linear-gradient(135deg, #67C23A, #50A028);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
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
.user-organization-info,
.user-contact-info, 
.user-account-info {
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-basic-info:last-child,
.user-organization-info:last-child,
.user-contact-info:last-child,
.user-account-info:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.user-basic-info h2,
.user-organization-info h2,
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

.course-detail-container {
  padding: 16px 0;
}

.course-detail-container p {
  margin-bottom: 16px;
  color: #606266;
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
  
  .course-group-detail-container {
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
  
  /* 详情弹窗响应式调整 */
  .detail-label {
    width: 100px;
    font-size: 14px;
  }
  
  .detail-value {
    font-size: 14px;
  }
}

/* 自定义旋转动画 */
@keyframes system-admin-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>