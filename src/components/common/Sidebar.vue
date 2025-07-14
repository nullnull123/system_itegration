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
            router
        >
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu
                                v-if="subItem.subs"
                                :index="subItem.index"
                                :key="subItem.index"
                            >
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item
                                    v-for="(threeItem,i) in subItem.subs"
                                    :key="i"
                                    :index="threeItem.index"
                                >{{ threeItem.title }}</el-menu-item>
                            </el-submenu>
                            <el-menu-item
                                v-else
                                :index="subItem.index"
                                :key="subItem.index"
                            >{{ subItem.title }}</el-menu-item>
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
            items: this.$global.isStu ?
            [
                {
                    icon: 'el-icon-lx-home',
                    index: 'dashboard',
                    title: '系统首页'
                },
                {
                    icon: 'el-icon-lx-calendar',
                    index: '3',
                    title: '语音克隆',
                    subs: [
                        {
                            index: '3-2',
                            title: '语音克隆',
                            subs: [
                                {
                                    index: 'markdown1',
                                    title: '基于XXTS模型的语音克隆'
                                },
                                {
                                    index: 'markdown',
                                    title: '基于FreeVC的语音克隆'
                                }
                            ]
                        },
                        {
                            index: 'form',
                            title: '文本转语音'
                        },
                        {
                            index: 'upload',
                            title: '批量文本转语音'
                        },
                        {
                            index: '/upload1',
                            title: '互动'
                        }
                    ]
                },
                {
                    icon: 'el-icon-rank',
                    index: '6',
                    title: '就业推荐',
                    subs: [
                        {
                            index: 'recommendJob',
                            title: '职位推荐'
                        }
                    ]
                },
                {
                    icon: 'el-icon-lx-redpacket_fill',
                    index: '/donate',
                    title: '支持作者'
                },
                {
                    icon: 'el-icon-lx-redpacket_fill',
                    index: '/test1',
                    title: '接入测试'
                }
            ]:
            [{
                    icon: 'el-icon-lx-home',
                    index: 'enterprisehome',
                    title: '系统首页'
                },
            {
                        icon: 'el-icon-rank',
                        index: 'manage',
                        title: '人才推荐'
                }
                    ]
        };
    },
    computed: {
        onRoutes() {
            return this.$route.path.replace('/', '');
        }
    },
    created() {
        // 通过 Event Bus 进行组件间通信，来折叠侧边栏
        bus.$on('collapse', msg => {
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
.sidebar > ul {
    height: 100%;
}
</style>
