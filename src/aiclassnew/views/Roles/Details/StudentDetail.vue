<template>
  <div class="student-detail-container">
    <!-- 学生用户详情部分 -->
    <div class="user-detail-container">
      <div class="user-header">
        <div class="avatar">
          <i class="el-icon-user"></i>
        </div>
        <h1>学生用户详情</h1>
        <div class="user-tag">
          <el-tag effect="dark">学生用户</el-tag>
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
          <div class="section-header">
            <h2>组织信息</h2>
            <el-button 
              v-if="!isEditingOrganization" 
              type="primary" 
              icon="el-icon-edit" 
              size="small"
              @click="startEditing('organization')">
              编辑
            </el-button>
            <div v-else>
              <el-button 
                type="warning" 
                icon="el-icon-refresh" 
                size="small"
                @click="cancelEditing('organization')">
                取消
              </el-button>
              <el-button 
                type="success" 
                icon="el-icon-check" 
                size="small"
                :loading="savingOrganization"
                @click="saveOrganizationInfo">
                保存
              </el-button>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">所属学校</span>
              <span class="info-value" v-if="!isEditingOrganization">
                {{ displayUserData.school_name || '未设置' }}
              </span>
              <span class="info-value" v-else>
                {{ displayUserData.school_name || '未设置' }}
                <el-tooltip content="学生无法更改所属学校" placement="top">
                  <i class="el-icon-warning" style="color: #E6A23C; margin-left: 5px;"></i>
                </el-tooltip>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">专业</span>
              <span class="info-value" v-if="!isEditingOrganization">
                {{ displayUserData.major || '未设置' }}
              </span>
              <el-input 
                v-else 
                v-model="editedOrganization.major" 
                placeholder="请输入专业">
              </el-input>
            </div>
            <div class="info-item">
              <span class="info-label">年级</span>
              <span class="info-value" v-if="!isEditingOrganization">
                {{ formatGrade(displayUserData.grade) || '未设置' }}
              </span>
              <el-select 
                v-else 
                v-model="editedOrganization.grade" 
                placeholder="请选择年级"
                style="width: 100%">
                <el-option
                  v-for="(label, value) in gradeOptions"
                  :key="value"
                  :label="label"
                  :value="value">
                </el-option>
              </el-select>
            </div>
          </div>
        </div>

        <div class="user-student-info">
          <div class="section-header">
            <h2>学籍信息</h2>
            <el-button 
              v-if="!isEditingStudent" 
              type="primary" 
              icon="el-icon-edit" 
              size="small"
              @click="startEditing('student')">
              编辑
            </el-button>
            <div v-else>
              <el-button 
                type="warning" 
                icon="el-icon-refresh" 
                size="small"
                @click="cancelEditing('student')">
                取消
              </el-button>
              <el-button 
                type="success" 
                icon="el-icon-check" 
                size="small"
                :loading="savingStudent"
                @click="saveStudentInfo">
                保存
              </el-button>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">学号</span>
              <span class="info-value" v-if="!isEditingStudent">
                {{ displayUserData.student_id || '未设置' }}
              </span>
              <el-input 
                v-else 
                v-model="editedStudent.student_id" 
                placeholder="请输入学号">
              </el-input>
            </div>
          </div>
        </div>

        <div class="user-contact-info">
          <div class="section-header">
            <h2>联系信息</h2>
            <div v-if="isEditingContact">
              <el-button 
                type="warning" 
                icon="el-icon-refresh" 
                size="small"
                @click="cancelEditing('contact')">
                取消
              </el-button>
              <el-button 
                type="success" 
                icon="el-icon-check" 
                size="small"
                :loading="savingContact"
                @click="saveContactInfo">
                保存
              </el-button>
            </div>
            <el-button 
              v-else 
              type="primary" 
              icon="el-icon-edit" 
              size="small"
              @click="startEditing('contact')">
              编辑
            </el-button>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">电子邮箱</span>
              <span class="info-value" v-if="!isEditingContact">
                {{ displayUserData.email || '未设置' }}
              </span>
              <el-input 
                v-else 
                v-model="editedContact.email" 
                placeholder="请输入电子邮箱">
              </el-input>
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
        <div class="loading-text">加载学生信息中...</div>
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
    
    <!-- 笔记列表区域 -->
    <management-section 
      title="笔记管理" 
      icon="el-icon-notebook-2"
      :loading="false"
      :error="null">
      
      <div class="note-management-container">
        <p>您可以查看和管理自己的学习笔记：</p>
        <el-button 
          type="primary" 
          icon="el-icon-document" 
          @click="viewNoteList">
          笔记列表
        </el-button>
      </div>
    </management-section>
    
    <!-- 习题管理区域 -->
    <management-section 
      title="习题管理" 
      icon="el-icon-notebook-1"
      :loading="false"
      :error="null">
      
      <div class="exercise-management-container">
        <p>您可以查看和完成习题：</p>
        <el-button 
          type="primary" 
          icon="el-icon-tickets" 
          @click="viewExerciseList">
          习题列表
        </el-button>
      </div>
    </management-section>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'StudentDetail',
  
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
    ...mapState('roles', ['userData']),
    
    // 创建一个新的计算属性用于显示，避免直接修改userData
    displayUserData() {
      return this.userData;
    },
    
    // 年级选项
    gradeOptions() {
      return {
        'freshman': '大一',
        'sophomore': '大二',
        'junior': '大三',
        'senior': '大四',
        'graduate': '研究生',
        'phd': '博士生'
      };
    }
  },
  
  data() {
    return {
      error: null,
      loading: true,
      
      // 编辑状态
      isEditingOrganization: false,
      isEditingStudent: false,
      isEditingContact: false,
      
      // 保存状态
      savingOrganization: false,
      savingStudent: false,
      savingContact: false,
      
      // 编辑中的数据
      editedOrganization: {
        major: '',
        grade: ''
      },
      editedStudent: {
        student_id: ''
      },
      editedContact: {
        email: ''
      },
      
      // 初始设置跟踪
      hasEditedOrganization: false,
      hasEditedContact: false
    };
  },
  
  created() {
    // 直接加载用户数据，不再从sessionStorage获取
    this.loadUserData();
  },
  
  methods: {
    ...mapActions('roles', [
      'getUserMe',
      'updateProfile'
    ]),
    
    async loadUserData() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('[StudentDetail] 开始加载用户数据...');
        
        // 1. 调用me接口获取用户数据
        const userData = await this.getUserMe();
        
        console.log('[StudentDetail] 用户数据加载成功:', userData);
        console.log('[StudentDetail] 当前 needs_initial_setup 状态:', userData.needs_initial_setup);
        
        // 2. 检查是否需要跟踪初始设置状态
        if (!userData.needs_initial_setup) {
          this.hasEditedOrganization = true;
          this.hasEditedContact = true;
          console.log('[StudentDetail] 用户已设置完成，标记编辑状态为已编辑');
        } else {
          console.log('[StudentDetail] 用户需要初始设置，当前编辑状态:', {
            hasEditedOrganization: this.hasEditedOrganization,
            hasEditedContact: this.hasEditedContact
          });
        }
      } catch (err) {
        this.error = err.message || '加载用户数据失败';
        console.error('[StudentDetail] 加载用户数据失败:', err);
      } finally {
        this.loading = false;
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
    },
    
    formatGrade(gradeCode) {
      const grades = {
        'freshman': '大一',
        'sophomore': '大二',
        'junior': '大三',
        'senior': '大四',
        'graduate': '研究生',
        'phd': '博士生'
      };
      return grades[gradeCode] || gradeCode;
    },
    
    // 新增：跳转到笔记列表
    viewNoteList() {
      // 跳转到笔记列表页面
      this.$router.push('/NoteCompletion/List');
    },
    
    // 新增：跳转到习题列表
    viewExerciseList() {
      // 跳转到习题列表页面
      this.$router.push('/ExerciseAssessment/List');
    },
    
    // 开始编辑
    startEditing(section) {
      switch(section) {
        case 'organization':
          this.isEditingOrganization = true;
          this.editedOrganization = {
            major: this.displayUserData.major || '',
            grade: this.displayUserData.grade || ''
          };
          break;
        case 'student':
          this.isEditingStudent = true;
          this.editedStudent = {
            student_id: this.displayUserData.student_id || ''
          };
          break;
        case 'contact':
          this.isEditingContact = true;
          this.editedContact = {
            email: this.displayUserData.email || ''
          };
          break;
      }
    },
    
    // 取消编辑
    cancelEditing(section) {
      switch(section) {
        case 'organization':
          this.isEditingOrganization = false;
          this.editedOrganization = {
            major: '',
            grade: ''
          };
          break;
        case 'student':
          this.isEditingStudent = false;
          this.editedStudent = {
            student_id: ''
          };
          break;
        case 'contact':
          this.isEditingContact = false;
          this.editedContact = {
            email: ''
          };
          break;
      }
    },
    
    // 保存组织信息
    async saveOrganizationInfo() {
      try {
        this.savingOrganization = true;
        
        // 构建更新数据
        const updateData = {
          major: this.editedOrganization.major,
          grade: this.editedOrganization.grade
        };
        
        // 调用更新接口
        await this.updateProfile(updateData);
        
        this.$message({
          type: 'success',
          message: '组织信息更新成功',
          duration: 2000
        });
        
        // 标记已编辑组织信息
        this.hasEditedOrganization = true;
        
        // 退出编辑模式
        this.isEditingOrganization = false;
        
        // 重新加载用户数据，获取最新信息
        console.log('[StudentDetail] 重新加载用户数据...');
        await this.loadUserData();
        
        console.log('[StudentDetail] 检查初始设置状态条件:');
        console.log('  hasEditedOrganization:', this.hasEditedOrganization);
        console.log('  hasEditedContact:', this.hasEditedContact);
        console.log('  needs_initial_setup:', this.displayUserData?.needs_initial_setup);
        
        // 检查是否需要更新初始设置状态
        if (this.hasEditedOrganization && this.hasEditedContact && this.displayUserData?.needs_initial_setup) {
          console.log('[StudentDetail] 满足条件，更新初始设置状态为已完成');
          await this.updateInitialSetupStatus(true);
        } else {
          console.log('[StudentDetail] 条件不满足，不更新初始设置状态');
        }
      } catch (error) {
        console.error('[StudentDetail] 保存组织信息失败:', error);
        this.$message.error('组织信息更新失败: ' + (error.message || '未知错误'));
      } finally {
        this.savingOrganization = false;
      }
    },
    
    // 保存学籍信息
    async saveStudentInfo() {
      try {
        this.savingStudent = true;
        
        // 构建更新数据
        const updateData = {
          student_id: this.editedStudent.student_id
        };
        
        // 调用更新接口
        await this.updateProfile(updateData);
        
        this.$message({
          type: 'success',
          message: '学籍信息更新成功',
          duration: 2000
        });
        
        // 退出编辑模式
        this.isEditingStudent = false;
        
        // 重新加载用户数据，获取最新信息
        await this.loadUserData();
      } catch (error) {
        console.error('[StudentDetail] 保存学籍信息失败:', error);
        this.$message.error('学籍信息更新失败: ' + (error.message || '未知错误'));
      } finally {
        this.savingStudent = false;
      }
    },
    
    // 保存联系信息
    async saveContactInfo() {
      try {
        this.savingContact = true;
        
        // 构建更新数据
        const updateData = {
          email: this.editedContact.email
        };
        
        // 调用更新接口
        await this.updateProfile(updateData);
        
        this.$message({
          type: 'success',
          message: '联系信息更新成功',
          duration: 2000
        });
        
        // 标记已编辑联系信息
        this.hasEditedContact = true;
        
        // 退出编辑模式
        this.isEditingContact = false;
        
        // 重新加载用户数据，获取最新信息
        console.log('[StudentDetail] 重新加载用户数据...');
        await this.loadUserData();
        
        console.log('[StudentDetail] 检查初始设置状态条件:');
        console.log('  hasEditedOrganization:', this.hasEditedOrganization);
        console.log('  hasEditedContact:', this.hasEditedContact);
        console.log('  needs_initial_setup:', this.displayUserData?.needs_initial_setup);
        
        // 检查是否需要更新初始设置状态
        if (this.hasEditedOrganization && this.hasEditedContact && this.displayUserData?.needs_initial_setup) {
          console.log('[StudentDetail] 满足条件，更新初始设置状态为已完成');
          await this.updateInitialSetupStatus(true);
        } else {
          console.log('[StudentDetail] 条件不满足，不更新初始设置状态');
        }
      } catch (error) {
        console.error('[StudentDetail] 保存联系信息失败:', error);
        this.$message.error('联系信息更新失败: ' + (error.message || '未知错误'));
      } finally {
        this.savingContact = false;
      }
    },
    
    // 更新初始设置状态
    async updateInitialSetupStatus(completed) {
      console.log('[StudentDetail] 开始更新初始设置状态, completed:', completed);
      
      try {
        const updateData = {
          needs_initial_setup: !completed,
          initial_setup_completed: completed
        };
        
        console.log('[StudentDetail] 更新初始设置状态的请求数据:', updateData);
        
        await this.updateProfile(updateData);
        
        console.log('[StudentDetail] 初始设置状态更新成功');
        
        // 重新加载用户数据
        console.log('[StudentDetail] 重新加载用户数据以验证状态更新...');
        await this.loadUserData();
        
        // 额外检查状态是否真的更新了
        if (this.displayUserData?.needs_initial_setup === !completed) {
          console.log('[StudentDetail] 状态更新验证成功:', {
            needs_initial_setup: this.displayUserData.needs_initial_setup,
            expected: !completed
          });
          this.$message.success('初始设置已完成');
        } else {
          console.error('[StudentDetail] 状态更新验证失败:', {
            actual: this.displayUserData?.needs_initial_setup,
            expected: !completed
          });
          this.$message.error('初始设置状态更新失败，但服务器返回成功');
        }
      } catch (error) {
        console.error('[StudentDetail] 更新初始设置状态失败:', error);
        this.$message.error('更新初始设置状态失败: ' + (error.message || '未知错误'));
      }
    }
  }
};
</script>

<style scoped>
.student-detail-container {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.user-basic-info, 
.user-organization-info,
.user-student-info,
.user-contact-info, 
.user-account-info {
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-basic-info:last-child,
.user-organization-info:last-child,
.user-student-info:last-child,
.user-contact-info:last-child,
.user-account-info:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.user-basic-info h2,
.user-organization-info h2,
.user-student-info h2,
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

.note-management-container,
.exercise-management-container {
  padding: 16px 0;
}

.note-management-container p,
.exercise-management-container p {
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

/* 响应式调整 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .student-detail-container {
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