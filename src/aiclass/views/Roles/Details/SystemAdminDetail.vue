<template>
  <div class="system-admin-detail-container">
    <!-- 加载状态 -->
    <el-card class="loading-card" v-if="loading && !userData">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载管理员信息...</p>
      </div>
    </el-card>
    
    <!-- 错误状态 -->
    <el-card class="error-card" v-else-if="error && !userData">
      <p>{{ error }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="loadUserData" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goBack" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>
    
    <!-- 主内容区域 - 使用tabs分页 -->
    <el-card class="detail-card" v-else>
      <div class="detail-header">
        <div class="header-main">
          <h2 class="outline-title">系统管理员详情</h2>
          <div class="outline-meta">
            <el-tag size="small" type="info">ID: #{{ userData.display_id }}</el-tag>
            <el-tag size="small" type="danger">系统管理员</el-tag>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" type="border-card" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="tab-content">
            <div class="user-basic-info">
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
                <div class="info-item">
                  <span class="info-label">电子邮箱</span>
                  <span class="info-value">{{ userData.email || '未设置' }}</span>
                </div>
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
          </div>
        </el-tab-pane>

        <!-- 用户管理标签页 -->
        <el-tab-pane label="用户管理" name="users">
          <management-section 
            title="用户管理" 
            :loading="userLoading"
            :error="userError"
            @retry="loadUsers">
            
            
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
        </el-tab-pane>

        <!-- 学校管理标签页 -->
        <el-tab-pane label="学校管理" name="schools">
          <management-section 
            title="学校管理" 
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
            
            <el-pagination
              class="pagination"
              @current-change="handleSchoolPageChange"
              :current-page="schoolPagination.page"
              :page-size="schoolPagination.pageSize"
              :total="schoolPagination.total"
              layout="total, prev, pager, next, jumper">
            </el-pagination>
          </management-section>
        </el-tab-pane>
      </el-tabs>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(userData.created_at) }}</p>
        <p v-if="userData.updated_at">
          更新时间: {{ formatDate(userData.updated_at) }}
        </p>
      </div>
    </el-card>

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


    <!-- 创建结果对话框 -->
    <el-dialog 
      :title="getResultDialogTitle" 
      :visible.sync="showCreateResultDialog" 
      width="700px"
      append-to-body>
      
      <el-alert
        :type="createResultType === 'school' ? 'info' : 'success'"
        :title="getResultAlertTitle"
        show-icon
        :closable="false"
        style="margin-bottom: 20px;">
      </el-alert>
      
      <el-table :data="createResultData" border stripe max-height="400">
        <el-table-column 
          v-for="(col, index) in createResultColumns" 
          :key="index"
          :prop="col.prop"
          :label="col.label"
          :width="col.width || ''">
        </el-table-column>
      </el-table>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateResultDialog = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="exportResults" 
          icon="el-icon-download">
          导出结果
        </el-button>
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
      activeTab: 'basic',
      userSearchQuery: '',
      userPagination: {
        page: 1,
        pageSize: 5,  // 修改为5，与后端实际返回条数匹配
        total: 0
      },
      userDetailDialogVisible: false,
      schoolDetailDialogVisible: false,
      schoolSearchQuery: '',
      schoolPagination: {
        page: 1,
        pageSize: 5,  // 可根据后端实际返回数量调整
        total: 0
      },
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
      },
      showCreateResultDialog: false,  // 控制结果对话框显示
      createResultData: [],           // 存储创建结果数据
      createResultType: '',           // 区分是教师还是学生
      createResultColumns: []         // 动态列配置
    };
  },
  computed: {
    ...mapState('roles', ['userData', 'users', 'schools', 'loading', 'userLoading', 'schoolLoading', 'error', 'userError', 'schoolError']),

    // 添加这两个计算属性
    getResultDialogTitle() {
      return '学校创建结果';
    },

    getResultAlertTitle() {
      return '成功创建 1 个学校';
    },
  },
  created() {
    this.loadUserData();
    this.loadUsers();
    this.loadSchools();
  },
  methods: {
    ...mapActions('roles', ['loadUserData', 'getUsers', 'getSchools', 'createSchool']),
    
    async loadUsers(page = this.userPagination.page) {
      try {
        // 传递当前页码给action
        const result = await this.getUsers(page);
        if (result && typeof result.total === 'number') {
          this.userPagination.total = result.total;
        } else {
          this.userPagination.total = 0;
        }
      } catch (error) {
        console.error('加载用户列表失败:', error);
        this.userPagination.total = 0;
      }
    },
    
    async loadSchools(page = this.schoolPagination.page) {
      try {
        // 传递页码参数
        const result = await this.getSchools(page);
        if (result && typeof result.total === 'number') {
          this.schoolPagination.total = result.total;
        } else {
          this.schoolPagination.total = 0;
        }
      } catch (error) {
        console.error('加载学校列表失败:', error);
        this.schoolPagination.total = 0;
      }
    },
    
    // 关键修改3：更新页码后重新加载
    handleUserPageChange(page) {
      this.userPagination.page = page;
      this.loadUsers(page);  // 显式传递页码
    },

    // 添加处理学校分页变化的方法
    handleSchoolPageChange(page) {
      this.schoolPagination.page = page;
      this.loadSchools(page);
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
        const result = await this.createSchool(this.newSchoolForm);

        // 处理成功响应 - 关键修改点
        if (result.school_admin) {
          this._showCreationResults('school', result.school_admin);
        }
        
        // 显示成功消息
        this.$message({
          type: 'success',
          message: '学校创建成功',
          duration: 2000
        });

        // ✅ 新增：重置分页状态并刷新列表
        this.schoolPagination.page = 1; // 重置到第一页（新学校通常在第一页）
        await this.loadSchools();       // 重新获取数据（更新total和列表）
        
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
    },


    // 辅助方法：显示创建结果
    _showCreationResults(type, data) {
      this.createResultType = type;
      this.createResultData = (type === 'school') ? [data] : data;
      
      this.createResultColumns = [
        { label: '用户名', prop: 'username' },
        { label: '初始密码', prop: 'initial_password' }
        // 可选：也可以包含 message
        // { label: '提示信息', prop: 'message' }
      ];
      
      this.showCreateResultDialog = true;
    },

    // 导出结果为CSV
    exportResults() {
      const type = this.createResultType;
      const fileName = `${type}创建结果_${new Date().toISOString().slice(0,10)}`;
      
      // 创建CSV内容
      const headers = this.createResultColumns.map(col => col.label).join(',');
      const rows = this.createResultData.map(item => 
        this.createResultColumns.map(col => 
          col.prop === 'initial_password' ? 
            `"${item[col.prop]}"` : 
            item[col.prop]
        ).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      
      // 创建并下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }


  }
}
</script>

<style scoped>
.system-admin-detail-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 42, 96, 0.08);
}

.user-detail-container {
  max-width: 1080px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.user-header {
  text-align: center;
  margin-bottom: 28px;
  padding: 32px 0 20px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-radius: 16px 16px 0 0;
  color: white;
  position: relative;
  overflow: hidden;
}

.user-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #818cf8, #c084fc);
}

.avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 36px;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
  border: 3px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  transform: translateY(-8px);
}

.avatar:hover {
  transform: translateY(-12px);
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.45);
}

.user-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-header p {
  font-size: 15px;
  opacity: 0.9;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
}

.user-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  margin-top: 12px;
  font-weight: 500;
}

.user-card {
  border-radius: 16px;
  border: none;
  overflow: hidden;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.user-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.user-basic-info, 
.user-contact-info, 
.user-account-info {
  padding: 24px;
  border-bottom: 1px solid #edf2f7;
}

.user-basic-info:last-child,
.user-contact-info:last-child,
.user-account-info:last-child {
  border-bottom: none;
}

.user-basic-info h2,
.user-contact-info h2,
.user-account-info h2 {
  font-size: 20px;
  color: #1e293b;
  margin-bottom: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-basic-info h2::before,
.user-contact-info h2::before,
.user-account-info h2::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(to bottom, #3b82f6, #6366f1);
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.info-item:hover {
  transform: translateY(-2px);
}

.info-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.info-value {
  font-size: 15.5px;
  color: #1e293b;
  font-weight: 500;
  min-height: 20px;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.info-value:hover {
  color: #2563eb;
}

.management-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #edf2f7;
  border-radius: 0 0 16px 16px;
}

.management-toolbar button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.management-toolbar button.primary {
  background: linear-gradient(to right, #3b82f6, #6366f1);
  color: white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.management-toolbar button.primary:hover {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.management-toolbar button.outline {
  background: transparent;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.management-toolbar button.outline:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.pagination {
  margin-top: 24px;
  justify-content: flex-end;
  padding: 0 24px 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  margin: 30px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.error-container {
  max-width: 600px;
  margin: 30px auto;
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.retry-button {
  margin-top: 16px;
  padding: 8px 24px;
  border-radius: 8px;
  background: linear-gradient(to right, #3b82f6, #6366f1);
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.management-section {
  margin-top: 24px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #edf2f7;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
}

.section-header h2 {
  font-size: 20px;
  color: #1e293b;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h2::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(to bottom, #3b82f6, #6366f1);
  border-radius: 2px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-overlay .loading-spinner {
  width: 32px;
  height: 32px;
}

.error-message {
  text-align: center;
  padding: 20px 0;
  color: #dc2626;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.error-message i {
  font-size: 24px;
}

/* 详情弹窗样式 */
.detail-content {
  padding: 16px 24px;
}

.detail-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: #f8fafc;
}

.detail-label {
  width: 140px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
}

.detail-value {
  flex: 1;
  color: #1e293b;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .system-admin-detail-container {
    padding: 16px;
    border-radius: 12px;
  }
  
  .user-header {
    padding: 24px 0 16px;
    border-radius: 12px 12px 0 0;
  }
  
  .avatar {
    width: 96px;
    height: 96px;
    font-size: 30px;
  }
  
  .user-basic-info, 
  .user-contact-info, 
  .user-account-info {
    padding: 20px 16px;
  }
  
  .management-toolbar {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }
  
  .management-toolbar button {
    width: 100%;
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  
  .detail-label {
    width: 110px;
    font-size: 14px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .system-admin-detail-container {
    background: #0f172a;
  }
  
  .user-detail-container {
    background: #1e293b;
  }
  
  .user-header {
    background: linear-gradient(135deg, #1e40af, #1d4ed8);
  }
  
  .user-basic-info, 
  .user-contact-info, 
  .user-account-info {
    border-bottom: 1px solid #334155;
  }
  
  .user-basic-info h2,
  .user-contact-info h2,
  .user-account-info h2 {
    color: #f1f5f9;
  }
  
  .info-label {
    color: #94a3b8;
  }
  
  .info-value {
    color: #f1f5f9;
  }
  
  .management-toolbar {
    background: #1e293b;
    border-top: 1px solid #334155;
  }
  
  .management-section {
    border: 1px solid #334155;
  }
  
  .section-header {
    border-bottom: 1px solid #334155;
  }
  
  .section-header h2 {
    color: #f1f5f9;
  }
  
  .loading-overlay {
    background: rgba(30, 41, 59, 0.85);
  }
}

.detail-footer {
  padding: 18px 24px;
  background: #f8fafc;
  border-top: 1px solid #edf2f7;
  color: #64748b;
  font-size: 14px;
  display: flex;
  justify-content: flex-start;
  gap: 40px;
  transition: all 0.3s ease;
  border-radius: 0 0 16px 16px;
}

.detail-footer:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
}

.detail-footer p {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  position: relative;
  padding-left: 24px;
}

.detail-footer p:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.detail-footer p:hover {
  color: #1e293b;
  transform: translateX(3px);
}

.detail-footer p i {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  color: #3b82f6;
  font-size: 10px;
}

.detail-footer p span {
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s ease;
}

.detail-footer p:hover span {
  color: #2563eb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .detail-footer {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 0;
  }
  
  .detail-footer p {
    padding-left: 28px;
    font-size: 13.5px;
  }
  
  .detail-footer p:before {
    width: 14px;
    height: 14px;
  }
}


</style>