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
                        <template v-for="(subItem,i) in item.subs">
                            <el-submenu
                                v-if="subItem.subs"
                                :index="subItem.index"
                                :key="i"
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
                                :key="i"
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
                // {
                //     icon: 'el-icon-lx-home',
                //     index: '/dashboard',
                //     title: '系统首页'
                // },
                {
                        icon: 'el-icon-headset',
                        index: '3',
                        title: '语音合成',
                        subs: [
                            {
                                index: '/VoiceCloning',
                                title: '语音克隆'
                            },
                            {
                                index: '/TextToSpeechs',
                                title: '批量文本转语音'
                            }
                            // {
                            //     index: '/interaction',
                            //     title: '留言互动'
                            // }
                        ]
                    },
                {
                    icon: 'el-icon-suitcase',
                    index: '6',
                    title: '就业推荐',
                    subs: [
                        {
                            index: '/recommendJob',
                            title: '职位推荐'
                        },
                        {
                            index: '/profile',
                            title: '个人简历'
                        }
                    ]
                },
                // {
                //     icon: 'el-icon-notebook-2',
                //     index: '7',
                //     title: '知识点分析',
                //     subs: [
                //         {
                //             index: '/KnowledgeRetrieval',
                //             title: '知识点检索'
                //         },
                //         {
                //             index: '/OutlineMatching',
                //             title: '大纲匹配'
                //         }
                //     ]
                // },
                {
                    icon: 'el-icon-school',
                    index: '8',
                    title: '智课工坊',
                    subs: [
                        {
                            index: '/SmartPrep',
                            title: '智能备课'
                        },
                        {
                            index: '/NoteCompletion',
                            title: '笔记补全'
                        },
                        {
                            index: '/ExerciseAssessment',
                            title: '习题测评'
                        }
                    ]
                },
                // {
                //     icon: 'el-icon-monitor',
                //     index: '9',
                //     title: '智能督导',
                //     subs: [
                //         {
                //             index: '/car',
                //             title: '课堂到课率和抬头率'
                //         },
                //         {
                //             index: '/icdc',
                //             title: '智能课堂数据采集'
                //         },
                //         {
                //             index: '/macs',
                //             title: '多智能体协同督导'
                //         }
                //     ]
                // },
                {
                    icon: 'el-icon-share',
                    index: '10',
                    title: '知识图谱',
                    subs: [
                        // {
                        //     index: '10-1',
                        //     title: '知识处理',
                        //     subs: [
                        //         {
                        //             index: '/EntityRecognition',
                        //             title: '实体识别'
                        //         },
                        //         {
                        //             index: '/RelationExtraction',
                        //             title: '关系抽取'
                        //         },
                        //         {
                        //             index: '/KnowledgeFusion',
                        //             title: '知识融合'
                        //         }
                        //     ]
                        // },
                        {
                            index: '/DataAcquisition',
                            title: '数据采集'
                        },
                        {
                            index: '/GeneticMapping',
                            title: '图谱构建'
                        }
                    ]
                },
                {
                    icon: 'el-icon-s-tools',
                    index: '11',
                    title: '工具',
                    subs: [
                        {
                            index: '/VideoCut',
                            title: '视频裁剪'
                        }
                    ]
                },
                // {
                //     icon: 'el-icon-lx-redpacket_fill',
                //     index: '/donate',
                //     title: '支持作者'
                // },
                // {
                //     icon: 'el-icon-s-promotion',
                //     index: '/test1',
                //     title: '接入测试'
                // }
            ]:
            [
                // {
                //     icon: 'el-icon-lx-home',
                //     index: '/enterprisehome',
                //     title: '系统首页'
                // },
            {
                        icon: 'el-icon-user-solid',
                        index: '/manage',
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
