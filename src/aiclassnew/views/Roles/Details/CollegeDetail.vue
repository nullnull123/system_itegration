<template>
  <div class="college-detail-container">
    <!-- 学院用户详情部分 -->
    <div class="user-detail-container">
      <div class="user-header">
        <div class="avatar">
          <i class="el-icon-office-building"></i>
        </div>
        <h1>学院用户详情</h1>
        <div class="user-tag">
          <el-tag type="warning" effect="dark">学院用户</el-tag>
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
        <div class="loading-text">加载学院信息中...</div>
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
    
    <!-- 课程组管理区域 -->
    <management-section 
      title="课程组管理" 
      icon="el-icon-collection"
      :loading="courseGroupLoading"
      :error="courseGroupError"
      @retry="loadCourseGroups">
      
      <div class="management-toolbar">
        <el-input 
          v-model="courseGroupSearchQuery" 
          placeholder="搜索课程组名称/ID" 
          style="width: 240px;"
          clearable
          @keyup.enter.native="searchCourseGroups">
          <el-button slot="append" icon="el-icon-search" @click="searchCourseGroups"></el-button>
        </el-input>
        <el-button type="primary" icon="el-icon-plus" @click="showCreateCourseGroupDialog = true" class="create-btn">
          创建课程组
        </el-button>
      </div>
      
      <el-table :data="courseGroups" border stripe>
        <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
        <el-table-column prop="name" label="课程组名称"></el-table-column>
        <el-table-column prop="college_name" label="所属学院"></el-table-column>
        <el-table-column prop="user_count" label="用户数" width="100"></el-table-column>
        <el-table-column prop="has_active_users" label="状态" width="100">
          <template slot-scope="{row}">
            <el-tag :type="row.has_active_users ? 'success' : 'info'">
              {{ row.has_active_users ? '有用户' : '无用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="{row}">
            <el-button size="mini" @click="viewCourseGroupDetail(row)">详情</el-button>
            <el-popconfirm
              v-if="!row.has_active_users"
              title="确定删除该课程组吗？"
              @confirm="deleteCourseGroup(row)"
              style="margin-left: 5px;">
              <el-button slot="reference" size="mini" type="danger">删除</el-button>
            </el-popconfirm>
            <el-tooltip v-else content="课程组内有用户，无法直接删除" placement="top">
              <el-button size="mini" type="danger" disabled style="margin-left: 5px;">删除</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        class="pagination"
        @current-change="handleCourseGroupPageChange"
        :current-page="courseGroupPagination.page"
        :page-size="courseGroupPagination.pageSize"
        :total="courseGroupPagination.total"
        layout="total, prev, pager, next, jumper">
      </el-pagination>
    </management-section>
    
    <!-- 创建课程组对话框 -->
    <el-dialog title="创建新课程组" :visible.sync="showCreateCourseGroupDialog" width="400px">
      <el-form :model="newCourseGroupForm" :rules="courseGroupRules" ref="courseGroupForm" label-width="80px">
        <el-form-item label="课程组名称" prop="name">
          <el-input v-model="newCourseGroupForm.name" placeholder="请输入课程组名称" maxlength="50" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCreateCourseGroupDialog">取 消</el-button>
        <el-button type="primary" @click="handleCreateCourseGroup" :loading="createCourseGroupLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 课程组详情对话框 -->
    <el-dialog title="课程组详情" :visible.sync="courseGroupDetailDialogVisible" width="600px">
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">课程组名称:</span>
          <span class="detail-value">{{ selectedCourseGroup?.name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">显示ID:</span>
          <span class="detail-value">#{{ selectedCourseGroup?.display_id || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">所属学院:</span>
          <span class="detail-value">{{ selectedCourseGroup?.college_name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">用户数:</span>
          <span class="detail-value">{{ selectedCourseGroup?.user_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="selectedCourseGroup?.has_active_users ? 'success' : 'info'">
              {{ selectedCourseGroup?.has_active_users ? '有用户' : '无用户' }}
            </el-tag>
          </span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeCourseGroupDetail">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'CollegeDetail',
  
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
    ...mapState('roles', ['userData', 'courseGroups', 'courseGroupLoading', 'courseGroupError']),
    ...mapGetters('roles', ['isCollegeUser']),
    
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
      
      // 课程组管理相关
      courseGroupPagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      courseGroupSearchQuery: '',
      showCreateCourseGroupDialog: false,
      newCourseGroupForm: {
        name: ''
      },
      createCourseGroupLoading: false,
      courseGroupRules: {
        name: [
          { required: true, message: '请输入课程组名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      },
      selectedCourseGroup: null,
      courseGroupDetailDialogVisible: false
    };
  },
  
  created() {
    // 1. 优先从sessionStorage获取登录用户数据
    this.loginUserData = this._parseLoginUserData();
    
    // 2. 如果sessionStorage中有数据，直接使用
    if (this.loginUserData) {
      console.log('[CollegeDetail] 使用sessionStorage中的登录用户数据');
      this.loading = false;
    } else {
      // 3. 如果没有，再从store中加载
      console.log('[CollegeDetail] 从store中加载用户数据');
      this.loadUserData();
    }
    
    this.loadCourseGroups();
  },
  
  methods: {
    ...mapActions('roles', [
      'loadUserData', 
      'getCourseGroups', 
      'createCourseGroup', 
      'deleteCourseGroup'
    ]),
    
    // 解析sessionStorage中的登录用户数据
    _parseLoginUserData() {
      try {
        const loginUserDataStr = sessionStorage.getItem('login_user_data');
        if (loginUserDataStr) {
          const loginUserData = JSON.parse(loginUserDataStr);
          
          // 确保数据结构符合预期
          if (loginUserData && loginUserData.role === 'college') {
            console.log('[CollegeDetail] 从sessionStorage获取到登录用户数据:', loginUserData);
            return loginUserData;
          }
        }
      } catch (e) {
        console.error('[CollegeDetail] 解析sessionStorage中的login_user_data失败:', e);
      }
      return null;
    },
    
    async loadCourseGroups() {
      try {
        const result = await this.getCourseGroups(this.courseGroupPagination.page);
        if (result && typeof result.total === 'number') {
          this.courseGroupPagination.total = result.total;
        } else {
          console.error('Invalid result from getCourseGroups:', result);
          this.courseGroupPagination.total = 0;
        }
      } catch (error) {
        console.error('[CollegeDetail] 获取课程组列表失败:', error);
        this.courseGroupError = error.message || '获取课程组列表失败';
      }
    },
    
    handleCourseGroupPageChange(page) {
      this.courseGroupPagination.page = page;
      this.loadCourseGroups();
    },
    
    searchCourseGroups() {
      console.log('搜索课程组:', this.courseGroupSearchQuery);
    },
    
    viewCourseGroupDetail(courseGroup) {
      this.selectedCourseGroup = courseGroup;
      this.courseGroupDetailDialogVisible = true;
    },
    
    closeCourseGroupDetail() {
      this.courseGroupDetailDialogVisible = false;
      this.selectedCourseGroup = null;
    },
    
    closeCreateCourseGroupDialog() {
      this.showCreateCourseGroupDialog = false;
      this.newCourseGroupForm.name = '';
      this.$nextTick(() => {
        if (this.$refs.courseGroupForm) {
          this.$refs.courseGroupForm.clearValidate();
        }
      });
    },
    
    async handleCreateCourseGroup() {
      try {
        await this.$refs.courseGroupForm.validate();
        this.createCourseGroupLoading = true;
        
        // 安全获取学院ID
        let collegeDisplayId;
        
        // 1. 优先尝试从sessionStorage获取
        const loginUserDataStr = sessionStorage.getItem('login_user_data');
        if (loginUserDataStr) {
          try {
            const loginUserData = JSON.parse(loginUserDataStr);
            if (loginUserData.college_display_id) {
              collegeDisplayId = String(loginUserData.college_display_id);
            } else if (loginUserData.college && loginUserData.college.display_id) {
              collegeDisplayId = String(loginUserData.college.display_id);
            }
          } catch (e) {
            console.error('[CollegeDetail] 解析sessionStorage中的login_user_data失败:', e);
          }
        }
        
        // 2. 如果还是找不到，尝试从userData中获取
        if (!collegeDisplayId && this.userData) {
          if (this.userData.college_display_id) {
            collegeDisplayId = String(this.userData.college_display_id);
          } else if (this.userData.college && this.userData.college.display_id) {
            collegeDisplayId = String(this.userData.college.display_id);
          }
        }
        
        // 3. 如果还是找不到，抛出明确错误
        if (!collegeDisplayId) {
          throw new Error('无法获取学院ID，请确保已正确登录');
        }
        
        const payload = {
          name: this.newCourseGroupForm.name,
          college_display_id: collegeDisplayId
        };
        
        console.log('[CollegeDetail] 发送创建课程组请求:', payload);
        
        await this.createCourseGroup(payload);
        
        this.$message({
          type: 'success',
          message: '课程组创建成功',
          duration: 2000
        });
        
        this.closeCreateCourseGroupDialog();
      } catch (error) {
        console.error('[CollegeDetail] 创建课程组失败详情:', error);
        if (error !== true) {
          // 显示更具体的错误信息
          let errorMessage = error.message || '创建课程组失败，请重试';
          
          // 处理后端返回的特定错误格式
          if (error.response && error.response.data && error.response.data.errors) {
            const errors = error.response.data.errors;
            if (errors.name) {
              errorMessage = `课程组名称: ${errors.name.join(', ')}`;
            } else if (errors.college_display_id) {
              errorMessage = `学院ID: ${errors.college_display_id.join(', ')}`;
            } else {
              errorMessage = JSON.stringify(errors);
            }
          } else if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          
          this.$message({
            type: 'error',
            message: errorMessage,
            duration: 3000
          });
        }
      } finally {
        this.createCourseGroupLoading = false;
      }
    },
    
    async deleteCourseGroup(courseGroup) {
      try {
        this.courseGroupLoading = true;
        
        // 如果课程组内有用户，需要强制删除
        const force = courseGroup.has_active_users;
        const reason = force ? "课程组重组，合并至其他课程组" : "删除课程组";
        
        await this.deleteCourseGroup({
          displayId: courseGroup.display_id,
          force: force,
          reason: reason
        });
        
        this.$message({
          type: 'success',
          message: '课程组删除成功',
          duration: 2000
        });
      } catch (error) {
        this.courseGroupError = error.message || '删除课程组失败';
        this.$message({
          type: 'error',
          message: error.message || '删除课程组失败',
          duration: 3000
        });
      } finally {
        this.courseGroupLoading = false;
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
.college-detail-container {
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
  background: linear-gradient(135deg, #E6A23C, #D68421);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
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

.management-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 10px;
}

.management-toolbar .create-btn {
  margin-left: 10px;
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
  
  .college-detail-container {
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