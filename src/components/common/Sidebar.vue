<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      background-color="#324157"
      text-color="#bfcbd9"
      active-text-color="#20a0ff"
      unique-opened
      @select="handleMenuSelect"
    >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </template>
            <template v-for="(subItem, i) in item.subs">
              <el-submenu
                v-if="subItem.subs"
                :index="subItem.index"
                :key="i"
              >
                <template slot="title">{{ subItem.title }}</template>
                <el-menu-item
                  v-for="(threeItem, j) in subItem.subs"
                  :key="j"
                  :index="threeItem.index"
                  >{{ threeItem.title }}</el-menu-item
                >
              </el-submenu>
              <!-- 特殊处理：退出智课工坊 -->
              <el-menu-item
                v-else
                :index="subItem.index"
                :key="i"
                @click.native="
                  subItem.index === 'ai-workshop-logout' ? handleLogout() : null
                "
                >{{ subItem.title }}</el-menu-item
              >
            </template>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import bus from '../common/bus';

export default {
  data() {
    return {
      collapse: false,
      items: this.$global.isStu
        ? [
            {
              icon: 'el-icon-headset',
              index: '1',
              title: '语音合成',
              subs: [
                { index: '/VoiceCloning', title: '语音克隆' },
                { index: '/TextToSpeechs', title: '批量文本转语音' }
              ]
            },
            {
              icon: 'el-icon-suitcase',
              index: '2',
              title: '就业推荐',
              subs: [
                { index: '/recommendJob', title: '职位推荐' },
                { index: '/profile', title: '个人简历' }
              ]
            },
            {
              icon: 'el-icon-rank',
              index: '4',
              title: '智课工坊',
              subs: [
                { index: 'SmartPrep', title: '智能备课' },
                { index: 'NoteCompletion', title: '笔记补全' },
                { index: 'ExerciseAssessment', title: '习题测评' },
                {
                  icon: 'el-icon-rank',
                  index: 'ai-workshop-logout', // 特殊标识
                  title: '退出智课工坊'
                }
              ]
            },
            {
              icon: 'el-icon-share',
              index: '6',
              title: '知识图谱',
              subs: [
                { index: '/DataAcquisition', title: '数据采集' },
                { index: '/GeneticMapping', title: '图谱构建' }
              ]
            },
            {
              icon: 'el-icon-s-tools',
              index: '7',
              title: '工具',
              subs: [
                { index: '/VideoCut', title: '视频裁剪' },
                { index: '/VideoCutS', title: '视频裁剪快捷' }
              ]
            },
            {
              icon: 'el-icon-video-camera',
              index: '8',
              title: 'PPT转视频',
              subs: [
                { index: '/PPT2Video', title: '基础版' },
                { index: 'http://luzixiang.cn:6002/', title: '完整版' }
              ]
            }
          ]
        : [
            {
              icon: 'el-icon-lx-home',
              index: '9',
              title: '系统首页',
              subs: [{ index: '/enterprisehome', title: '系统首页' }]
            },
            {
              icon: 'el-icon-user-solid',
              index: '10',
              title: '人才推荐',
              subs: [{ index: '/manage', title: '人才推荐' }]
            }
          ]
    };
  },
  computed: {
    onRoutes() {
      return this.$route.path.replace('/', '');
    }
  },
  methods: {
    // 新增：处理退出逻辑
    async handleLogout() {
      // 清除 token 和用户数据
      localStorage.removeItem('ai_workshop_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');

      this.$message({
        type: 'success',
        message: '已安全退出智课工坊',
        duration: 1500
      });

      // 跳转到登录页，并携带当前路径作为重定向目标
      this.$router.push({
        path: '/ai-workshop-login',
        query: { loggedOut: 'true', redirect: this.$route.path }
      });
    },

    handleMenuSelect(index) {
      // 如果是退出项，不走这里（由 @click.native 处理）
      if (index === 'ai-workshop-logout') {
        return;
      }

      // 判断是否是外部链接
      if (index.startsWith('http')) {
        window.open(index, '_blank');
      } else {
        this.$router.push(index);
      }
    }
  },
  created() {
    bus.$on('collapse', (msg) => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });
  }
};
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}
/* 折叠状态 —— 但依然显示文字 */
.sidebar-el-menu.el-menu--collapse {
  width: 120px !important;
}
/* 强制显示文字 */
.sidebar-el-menu.el-menu--collapse .el-submenu__title span,
.sidebar-el-menu.el-menu--collapse .el-menu-item span {
  display: inline !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: auto !important;
  white-space: nowrap;
  padding-left: 5px;
}
.sidebar > ul {
  height: 100%;
}
</style>