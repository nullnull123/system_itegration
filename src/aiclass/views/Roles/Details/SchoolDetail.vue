<template>
  <div class="school-detail-container">


    <el-tabs v-model="activeSchoolTab" type="border-card" class="detail-tabs">
      <!-- 学校详情标签页 -->
      <el-tab-pane label="学校详情" name="schoolDetail">
        <div class="user-detail-container">
          <div class="user-header">
            <div class="avatar">
              <i class="el-icon-school"></i>
            </div>
            <h1>学校用户详情</h1>
            <div class="user-tag">
              <el-tag type="info" effect="dark">学校用户</el-tag>
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
            <div class="loading-text">加载学校信息中...</div>
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
      </el-tab-pane>

      <!-- 学院管理标签页 -->
      <el-tab-pane label="学院管理" name="colleges">
        <management-section 
          title="学院管理" 
          icon="el-icon-reading"
          :loading="collegeLoading"
          :error="collegeError"
          @retry="loadColleges">
          
          <div class="management-toolbar">
            <el-button type="primary" icon="el-icon-plus" @click="showCreateCollegeDialog = true" class="create-btn">
              创建学院
            </el-button>
          </div>
          
          <el-table :data="colleges" border stripe>
            <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
            <el-table-column prop="name" label="学院名称"></el-table-column>
            <el-table-column prop="school_name" label="所属学校"></el-table-column>
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
                <el-button size="mini" @click="viewCollegeDetail(row)">详情</el-button>
                <el-popconfirm
                  v-if="!row.has_active_users"
                  title="确定删除该学院吗？"
                  @confirm="delete_College(row)"
                  style="margin-left: 5px;">
                  <el-button slot="reference" size="mini" type="danger">删除</el-button>
                </el-popconfirm>
                <el-tooltip v-else content="学院内有用户，无法直接删除" placement="top">
                  <el-button size="mini" type="danger" disabled style="margin-left: 5px;">删除</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          
          <el-pagination
            class="pagination"
            @current-change="handleCollegePageChange"
            :current-page="collegePagination.page"
            :page-size="collegePagination.pageSize"
            :total="collegePagination.total"
            layout="total, prev, pager, next, jumper">
          </el-pagination>
        </management-section>
      </el-tab-pane>

      <!-- 人员管理标签页（教师和学生） -->
      <el-tab-pane label="人员管理" name="personnel">
        <!-- 教师管理区域 -->
        <management-section 
          title="教师管理" 
          icon="el-icon-user-solid"
          :loading="teacherLoading"
          :error="teacherError">
          
          <div class="management-toolbar">
            <el-button 
              type="primary" 
              icon="el-icon-upload" 
              @click="showBulkTeacherDialog = true"
              :disabled="colleges.length === 0">
              批量创建教师
            </el-button>
            <el-button type="danger" icon="el-icon-delete" @click="showBulkDeleteTeacherDialog = true">
              批量删除教师
            </el-button>
          </div>
        </management-section>
        
        <!-- 学生管理区域 -->
        <management-section 
          title="学生管理" 
          icon="el-icon-user"
          :loading="studentLoading"
          :error="studentError">
          
          <div class="management-toolbar">
            <el-button type="primary" icon="el-icon-upload" @click="showBulkStudentDialog = true">
              批量创建学生
            </el-button>
            <el-button type="danger" icon="el-icon-delete" @click="showBulkDeleteStudentDialog = true">
              批量删除学生
            </el-button>
          </div>
        </management-section>
      </el-tab-pane>
    </el-tabs>

    
    <!-- 创建学院对话框 -->
    <el-dialog title="创建新学院" :visible.sync="showCreateCollegeDialog" width="400px">
      <el-form :model="newCollegeForm" :rules="collegeRules" ref="collegeForm" label-width="80px">
        <el-form-item label="学院名称" prop="name">
          <el-input v-model="newCollegeForm.name" placeholder="请输入学院名称" maxlength="50" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCreateCollegeDialog">取 消</el-button>
        <el-button type="primary" @click="handleCreateCollege" :loading="createCollegeLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 学院详情对话框 -->
    <el-dialog title="学院详情" :visible.sync="collegeDetailDialogVisible" width="600px">
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">学院名称:</span>
          <span class="detail-value">{{ selectedCollege?.name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">显示ID:</span>
          <span class="detail-value">#{{ selectedCollege?.display_id || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">所属学校:</span>
          <span class="detail-value">{{ selectedCollege?.school_name || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">用户数:</span>
          <span class="detail-value">{{ selectedCollege?.user_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">
            <el-tag :type="selectedCollege?.has_active_users ? 'success' : 'info'">
              {{ selectedCollege?.has_active_users ? '有用户' : '无用户' }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item" v-if="selectedCollege?.course_groups?.length > 0">
          <span class="detail-label">课程组:</span>
          <div class="detail-value">
            <el-tag 
              v-for="group in selectedCollege.course_groups" 
              :key="group.display_id" 
              type="primary" 
              style="margin-right: 5px; margin-bottom: 5px;">
              {{ group.name }} (#{{ group.display_id }})
            </el-tag>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeCollegeDetail">关闭</el-button>
      </div>
    </el-dialog>
    
    <!-- 批量创建教师对话框 - 添加了课程组选择 -->
    <el-dialog title="批量创建教师" :visible.sync="showBulkTeacherDialog" width="500px">
      <el-form :model="bulkTeacherForm" label-width="120px">
        <el-form-item label="教师工号列表">
          <el-input
            type="textarea"
            v-model="bulkTeacherForm.employee_ids"
            placeholder="每行一个工号，例如：T001"
            rows="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属学院" required>
          <el-select 
            v-model="bulkTeacherForm.college_display_id" 
            placeholder="请选择学院" 
            style="width: 100%"
            @change="handleCollegeChange">
            <el-option
              v-for="college in colleges"
              :key="college.display_id"
              :label="college.name"
              :value="college.display_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属课程组" required>
          <el-select 
            v-model="bulkTeacherForm.course_group_display_id" 
            placeholder="请选择课程组" 
            style="width: 100%"
            :disabled="selectedCollegeCourseGroups.length === 0">
            <el-option
              v-for="group in selectedCollegeCourseGroups"
              :key="group.display_id"
              :label="group.name"
              :value="group.display_id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBulkTeacherDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleBulkCreateTeachers" :loading="bulkTeacherLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 批量删除教师对话框 -->
    <el-dialog title="批量删除教师" :visible.sync="showBulkDeleteTeacherDialog" width="500px">
      <el-form :model="bulkDeleteTeacherForm" label-width="120px">
        <el-form-item label="教师工号列表" required>
          <el-input
            type="textarea"
            v-model="bulkDeleteTeacherForm.employee_ids"
            placeholder="每行一个工号，例如：T001"
            rows="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="删除原因" required>
          <el-input
            v-model="bulkDeleteTeacherForm.reason"
            placeholder="请输入删除原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBulkDeleteTeacherDialog = false">取 消</el-button>
        <el-button type="danger" @click="handleBulkDeleteTeachers" :loading="bulkDeleteTeacherLoading">删除</el-button>
      </div>
    </el-dialog>
    
    <!-- 批量创建学生对话框 -->
    <el-dialog title="批量创建学生" :visible.sync="showBulkStudentDialog" width="500px">
      <el-form :model="bulkStudentForm" label-width="120px">
        <el-form-item label="学生学号列表">
          <el-input
            type="textarea"
            v-model="bulkStudentForm.student_ids"
            placeholder="每行一个学号，例如：20230001"
            rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBulkStudentDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleBulkCreateStudents" :loading="bulkStudentLoading">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 批量删除学生对话框 -->
    <el-dialog title="批量删除学生" :visible.sync="showBulkDeleteStudentDialog" width="500px">
      <el-form :model="bulkDeleteStudentForm" label-width="120px">
        <el-form-item label="学生学号列表" required>
          <el-input
            type="textarea"
            v-model="bulkDeleteStudentForm.student_ids"
            placeholder="每行一个学号，例如：20230001"
            rows="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="删除原因" required>
          <el-input
            v-model="bulkDeleteStudentForm.reason"
            placeholder="请输入删除原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showBulkDeleteStudentDialog = false">取 消</el-button>
        <el-button type="danger" @click="handleBulkDeleteStudents" :loading="bulkDeleteStudentLoading">删除</el-button>
      </div>
    </el-dialog>


    <!-- 创建结果对话框 -->
    <el-dialog 
      :title="getResultDialogTitle" 
      :visible.sync="showCreateResultDialog" 
      width="700px"
      append-to-body>
      
      <el-alert
        :type="createResultType === 'college' ? 'info' : 'success'"
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
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'SchoolDetail',
  
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
    ...mapState('roles', ['userData', 'colleges', 'collegeLoading', 'collegeError', 'collegeDetail']),
    ...mapGetters('roles', ['isSchoolUser']),
    
    // 修复：创建一个新的计算属性用于显示，避免直接修改userData
    displayUserData() {
      // 优先使用从sessionStorage获取的登录用户数据
      return this.loginUserData || this.userData;
    },

    // 添加这两个计算属性
    getResultDialogTitle() {
      if (this.createResultType === 'teacher') {
        return '教师创建结果';
      } else if (this.createResultType === 'student') {
        return '学生创建结果';
      } else if (this.createResultType === 'college') {
        return '学院创建结果';
      }
      // 提供一个默认返回值以防 createResultType 有意外值
      return '创建结果';
    },

    getResultAlertTitle() {
      if (this.createResultType === 'college') {
        // 对于学院，每次都只创建一个
        return '成功创建 1 个学院';
      } else {
        // 对于教师和学生，使用原来的逻辑
        return `成功创建 ${this.createResultData.length} 个${this.createResultType === 'teacher' ? '教师' : '学生'}`;
      }
    },
  },
  
  data() {
    return {
      activeSchoolTab: 'schoolDetail',
      error: null,
      loading: true,
      loginUserData: null, // 存储从sessionStorage获取的登录用户数据
      
      // 学院管理相关
      collegePagination: {
        page: 1,
        pageSize: 5,
        total: 0
      },
      collegeSearchQuery: '',
      showCreateCollegeDialog: false,
      newCollegeForm: {
        name: ''
      },
      createCollegeLoading: false,
      collegeRules: {
        name: [
          { required: true, message: '请输入学院名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      },
      selectedCollege: null,
      collegeDetailDialogVisible: false,
      courseGroups: [],
      
      // 教师管理相关
      teacherLoading: false,
      teacherError: null,
      showBulkTeacherDialog: false,
      bulkTeacherForm: {
        employee_ids: '',
        college_display_id: null,
        course_group_display_id: null // 新增：课程组ID
      },
      bulkTeacherLoading: false,
      bulkTeacherTimeout: null, // 用于处理请求超时
      selectedCollegeCourseGroups: [], // 新增：当前选中学院的课程组
      
      // 批量删除教师
      showBulkDeleteTeacherDialog: false,
      bulkDeleteTeacherForm: {
        employee_ids: '',
        reason: ''
      },
      bulkDeleteTeacherLoading: false,
      
      // 学生管理相关
      studentLoading: false,
      studentError: null,
      showBulkStudentDialog: false,
      bulkStudentForm: {
        student_ids: ''
      },
      bulkStudentLoading: false,
      
      // 批量删除学生
      showBulkDeleteStudentDialog: false,
      bulkDeleteStudentForm: {
        student_ids: '',
        reason: ''
      },
      bulkDeleteStudentLoading: false,
      showCreateResultDialog: false,  // 控制结果对话框显示
      createResultData: [],           // 存储创建结果数据
      createResultType: '',           // 区分是教师还是学生
      createResultColumns: []         // 动态列配置
    };
  },
  
  created() {
    // 1. 优先从sessionStorage获取登录用户数据
    this.loginUserData = this._parseLoginUserData();
    
    // 2. 如果sessionStorage中有数据，直接使用
    if (this.loginUserData) {
      console.log('[SchoolDetail] 使用sessionStorage中的登录用户数据');
      this.loading = false;
    } else {
      // 3. 如果没有，再从store中加载
      console.log('[SchoolDetail] 从store中加载用户数据');
      this.loadUserData();
    }
    
    this.loadColleges();
  },
  
  beforeDestroy() {
    // 清理：清除可能的超时定时器
    if (this.bulkTeacherTimeout) {
      clearTimeout(this.bulkTeacherTimeout);
      this.bulkTeacherTimeout = null;
    }
  },
  
  methods: {
    ...mapActions('roles', [
      'loadUserData', 
      'getColleges', 
      'getCollegeDetail', // ✅ 已添加：获取学院详情
      'createCollege', 
      'deleteCollege',
      'bulkCreateTeachers',
      'bulkDeleteTeachers',
      'bulkCreateStudents',
      'bulkDeleteStudents'
    ]),
    
    // 解析sessionStorage中的登录用户数据
    _parseLoginUserData() {
      try {
        const loginUserDataStr = sessionStorage.getItem('login_user_data');
        if (loginUserDataStr) {
          const loginUserData = JSON.parse(loginUserDataStr);
          
          // 确保数据结构符合预期
          if (loginUserData && loginUserData.role === 'school') {
            console.log('[SchoolDetail] 从sessionStorage获取到登录用户数据:', loginUserData);
            return loginUserData;
          }
        }
      } catch (e) {
        console.error('[SchoolDetail] 解析sessionStorage中的login_user_data失败:', e);
      }
      return null;
    },
    
    async loadColleges(page = this.collegePagination.page) {
      try {
        const result = await this.getColleges(page);
        if (result && typeof result.total === 'number') {
          this.collegePagination.total = result.total;
        } else {
          console.error('Invalid result from getColleges:', result);
          this.collegePagination.total = 0;
        }
      } catch (error) {
        console.error('[SchoolDetail] 获取学院列表失败:', error);
        this.collegeError = error.message || '获取学院列表失败';
      }
    },
    
    handleCollegePageChange(page) {
      this.collegePagination.page = page;
      this.loadColleges(page);
    },
    
    
    viewCollegeDetail(college) {
      this.selectedCollege = college;
      this.collegeDetailDialogVisible = true;
    },
    
    closeCollegeDetail() {
      this.collegeDetailDialogVisible = false;
      this.selectedCollege = null;
    },
    
    closeCreateCollegeDialog() {
      this.showCreateCollegeDialog = false;
      this.newCollegeForm.name = '';
      this.$nextTick(() => {
        if (this.$refs.collegeForm) {
          this.$refs.collegeForm.clearValidate();
        }
      });
    },
    
    async handleCreateCollege() {
      try {
        await this.$refs.collegeForm.validate();
        this.createCollegeLoading = true;
        
        // ✅ 修复：安全获取学校ID
        let schoolDisplayId;
        
        // 1. 优先尝试从sessionStorage获取（刚从登录页面传递过来的数据）
        const loginUserDataStr = sessionStorage.getItem('login_user_data');
        if (loginUserDataStr) {
          try {
            const loginUserData = JSON.parse(loginUserDataStr);
            if (loginUserData.school_display_id) {
              schoolDisplayId = String(loginUserData.school_display_id);
            } else if (loginUserData.school && loginUserData.school.display_id) {
              schoolDisplayId = String(loginUserData.school.display_id);
            }
          } catch (e) {
            console.error('[SchoolDetail] 解析sessionStorage中的login_user_data失败:', e);
          }
        }
        
        // 2. 如果还是找不到，尝试从userData中获取
        if (!schoolDisplayId && this.userData) {
          if (this.userData.school_display_id) {
            schoolDisplayId = String(this.userData.school_display_id);
          } else if (this.userData.school && this.userData.school.display_id) {
            schoolDisplayId = String(this.userData.school.display_id);
          }
        }
        
        // 3. 如果还是找不到，抛出明确错误
        if (!schoolDisplayId) {
          throw new Error('无法获取学校ID，请确保已正确登录');
        }
        
        const payload = {
          name: this.newCollegeForm.name,
          school_display_id: schoolDisplayId
        };
        
        console.log('[SchoolDetail] 发送创建学院请求:', payload);
        
        const result = await this.createCollege(payload);

        console.log('[result] 发送创建学院请求:', result);

        // 处理成功响应 - 关键修改点
        if (result.college_admin) {
          this._showCreationResults('college', result.college_admin);
        }
        
        this.$message({
          type: 'success',
          message: '学院创建成功',
          duration: 2000
        });

        // ✅ 新增：重置分页状态并刷新列表
        this.collegePagination.page = 1; // 重置到第一页（新学校通常在第一页）
        await this.loadColleges();       // 重新获取数据（更新total和列表）
        
        this.closeCreateCollegeDialog();
      } catch (error) {
        console.error('[SchoolDetail] 创建学院失败详情:', error);
        if (error !== true) {
          // 显示更具体的错误信息
          let errorMessage = error.message || '创建学院失败，请重试';
          
          // 处理后端返回的特定错误格式
          if (error.response && error.response.data && error.response.data.errors) {
            const errors = error.response.data.errors;
            if (errors.name) {
              errorMessage = `学院名称: ${errors.name.join(', ')}`;
            } else if (errors.school_display_id) {
              errorMessage = `学校ID: ${errors.school_display_id.join(', ')}`;
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
        this.createCollegeLoading = false;
      }
    },
    
    
    async delete_College(college) {
      try {
        // ✅ 移除：this.collegeLoading = true;
        
        // 如果学院内有用户，需要强制删除
        const force = college.has_active_users;
        const reason = force ? "学院重组，合并至其他学院组" : "删除学院";
        
        await this.deleteCollege({
          displayId: college.display_id,
          force: force,
          reason: reason
        });
        
        this.$message({
          type: 'success',
          message: '学院删除成功',
          duration: 2000
        });

        // ✅ 新增：重置分页状态并刷新列表
        this.collegePagination.page = 1; // 重置到第一页（新学校通常在第一页）
        await this.loadColleges();       // 重新获取数据（更新total和列表）
      } catch (error) {
        // ✅ 移除：this.collegeError = error.message || '删除学院失败';
        this.$message({
          type: 'error',
          message: error.message || '删除学院失败',
          duration: 3000
        });
      }
      // ✅ 移除：finally 块，因为 loading 状态已由 store 管理
    },
    
    // 新增：处理学院选择变化，加载课程组
    async handleCollegeChange(displayId) {
      if (!displayId) {
        this.selectedCollegeCourseGroups = [];
        this.bulkTeacherForm.course_group_display_id = null;
        return;
      }
      
      try {
        // 调用getCollegeDetail获取学院详情
        const collegeDetail = await this.getCollegeDetail(displayId);
        
        // 提取课程组信息
        this.selectedCollegeCourseGroups = collegeDetail.course_groups || [];
        
        // 如果课程组为空，重置选择
        if (this.selectedCollegeCourseGroups.length === 0) {
          this.bulkTeacherForm.course_group_display_id = null;
          this.$message.warning('该学院暂无课程组');
        }
      } catch (error) {
        console.error('[SchoolDetail] 获取学院详情失败:', error);
        this.$message.error('获取学院详情失败，请重试');
        this.selectedCollegeCourseGroups = [];
        this.bulkTeacherForm.course_group_display_id = null;
      }
    },
    
    // 批量创建教师
    async handleBulkCreateTeachers() {
      if (this.colleges.length === 0) {
        this.$message.error('请先创建学院');
        return;
      }
      
      // 创建超时控制变量
      let timeoutId = null;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('请求超时，请稍后重试'));
        }, 30000); // 30秒超时
      });
      
      try {
        this.bulkTeacherLoading = true;
        
        // 验证输入数据
        const employeeIds = this.bulkTeacherForm.employee_ids
          .split('\n')
          .map(id => id.trim())
          .filter(id => id);
        
        if (employeeIds.length === 0) {
          throw new Error('请输入至少一个工号');
        }
        
        if (!this.bulkTeacherForm.college_display_id) {
          throw new Error('请选择学院');
        }
        
        // ✅ 新增：验证课程组选择
        if (!this.bulkTeacherForm.course_group_display_id) {
          throw new Error('请选择课程组');
        }
        
        // ✅ 修正：添加school_display_id到请求负载
        const payload = {
          employee_ids: employeeIds,
          school_display_id: parseInt(this._getSchoolId()), // 获取学校ID
          college_display_id: parseInt(this.bulkTeacherForm.college_display_id),
          course_group_display_id: parseInt(this.bulkTeacherForm.course_group_display_id)
        };
        
        // 使用Promise.race实现请求超时控制
        const result = await Promise.race([
          this.bulkCreateTeachers(payload),
          timeoutPromise
        ]);

        // 处理成功响应 - 关键修改点
        if (result.created_accounts && result.created_accounts.length > 0) {
          this._showCreationResults('teacher', result.created_accounts);
        }
        
        // 请求成功，清除可能的超时定时器
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        this.$message({
          type: 'success',
          message: '教师批量创建成功',
          duration: 2000
        });
        
        this.showBulkTeacherDialog = false;
        this.bulkTeacherForm.employee_ids = ''; // 清空输入
        this.bulkTeacherForm.course_group_display_id = null; // 重置课程组选择
        return result;
      } catch (error) {
        // ...错误处理保持不变...
      } finally {
        // 确保加载状态在所有情况下都被重置
        this.bulkTeacherLoading = false;
      }
    },
    
    // 批量删除教师
    async handleBulkDeleteTeachers() {
      try {
        this.bulkDeleteTeacherLoading = true;
        
        const employeeIds = this.bulkDeleteTeacherForm.employee_ids
          .split('\n')
          .map(id => id.trim())
          .filter(id => id);
        
        if (employeeIds.length === 0) {
          throw new Error('请输入至少一个工号');
        }
        
        const payload = {
          employee_ids: employeeIds,
          confirm: true,
          reason: this.bulkDeleteTeacherForm.reason
        };
        
        await this.bulkDeleteTeachers(payload);
        
        this.$message({
          type: 'success',
          message: '教师批量删除成功',
          duration: 2000
        });
        
        this.showBulkDeleteTeacherDialog = false;
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.message || '批量删除教师失败',
          duration: 3000
        });
      } finally {
        this.bulkDeleteTeacherLoading = false;
      }
    },
    
    // 批量创建学生
    async handleBulkCreateStudents() {
      try {
        this.bulkStudentLoading = true;
        
        const studentIds = this.bulkStudentForm.student_ids
          .split('\n')
          .map(id => id.trim())
          .filter(id => id);
        
        if (studentIds.length === 0) {
          throw new Error('请输入至少一个学号');
        }
        
        const payload = {
          student_ids: studentIds,
          school_display_id: this._getSchoolId()  // ✅ 使用正确的school_display_id
        };
        
        const result = await this.bulkCreateStudents(payload);

        // 处理成功响应 - 关键修改点
        if (result.created_accounts && result.created_accounts.length > 0) {
          this._showCreationResults('student', result.created_accounts);
        }
        
        this.$message({
          type: 'success',
          message: '学生批量创建成功',
          duration: 2000
        });
        
        this.showBulkStudentDialog = false;
        return result;
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.message || '批量创建学生失败',
          duration: 3000
        });
      } finally {
        this.bulkStudentLoading = false;
      }
    },
    
    // 批量删除学生
    async handleBulkDeleteStudents() {
      try {
        this.bulkDeleteStudentLoading = true;
        
        const studentIds = this.bulkDeleteStudentForm.student_ids
          .split('\n')
          .map(id => id.trim())
          .filter(id => id);
        
        if (studentIds.length === 0) {
          throw new Error('请输入至少一个学号');
        }
        
        const payload = {
          student_ids: studentIds,
          confirm: true,
          reason: this.bulkDeleteStudentForm.reason
        };
        
        await this.bulkDeleteStudents(payload);
        
        this.$message({
          type: 'success',
          message: '学生批量删除成功',
          duration: 2000
        });
        
        this.showBulkDeleteStudentDialog = false;
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.message || '批量删除学生失败',
          duration: 3000
        });
      } finally {
        this.bulkDeleteStudentLoading = false;
      }
    },

    // 辅助方法：显示创建结果
    _showCreationResults(type, data) {
      this.createResultType = type;
      // 修改点：确保 createResultData 是一个数组
      // 如果是 'college' 类型，data 是一个对象，需要将其包装在数组中
      // 如果是 'teacher' 或 'student' 类型，data 本身应该是数组
      this.createResultData = (type === 'college') ? [data] : data;
      // 根据类型配置表格列
      if (type === 'teacher') {
        this.createResultColumns = [
          { label: '工号', prop: 'employee_id' },
          { label: '用户名', prop: 'username' },
          { label: '初始密码', prop: 'initial_password' }
        ];
      } else if(type === 'student') {
        this.createResultColumns = [
          { label: '学号', prop: 'student_id' },
          { label: '用户名', prop: 'username' },
          { label: '初始密码', prop: 'initial_password' }
        ];
      } else{ // type === 'college'
        this.createResultColumns = [
          { label: '用户名', prop: 'username' },
          { label: '初始密码', prop: 'initial_password' }
          // 可选：也可以包含 message
          // { label: '提示信息', prop: 'message' }
        ];
      }
      this.showCreateResultDialog = true;
    },
    
    // ✅ 添加：安全获取学校ID的方法
    _getSchoolId() {
      // 1. 优先尝试从sessionStorage获取
      const loginUserDataStr = sessionStorage.getItem('login_user_data');
      if (loginUserDataStr) {
        try {
          const loginUserData = JSON.parse(loginUserDataStr);
          if (loginUserData.school_display_id) {
            return String(loginUserData.school_display_id);
          } else if (loginUserData.school && loginUserData.school.display_id) {
            return String(loginUserData.school.display_id);
          }
        } catch (e) {
          console.error('[SchoolDetail] 解析sessionStorage中的login_user_data失败:', e);
        }
      }
      
      // 2. 如果还是找不到，尝试从userData中获取
      if (this.userData) {
        if (this.userData.school_display_id) {
          return String(this.userData.school_display_id);
        } else if (this.userData.school && this.userData.school.display_id) {
          return String(this.userData.school.display_id);
        }
      }
      
      return null;
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
};
</script>

<style scoped>
.school-detail-container {
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
  background: linear-gradient(135deg, #409EFF, #66B2FF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
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
  
  .school-detail-container {
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


/* 结果对话框样式 */
.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.result-icon {
  font-size: 24px;
  color: #67c23a;
  margin-right: 10px;
}

.result-count {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

</style>