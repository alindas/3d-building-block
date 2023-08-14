import { defineConfig } from 'umi';

export default defineConfig({
  favicon: '/favicon.png',
  nodeModulesTransform: {
    type: 'none',
  },
  dva: {
    immer: true,
    hmr: false,
  },
  routes: [
    {
      path: '/',
      component: '@/layout/SecurityLayout',
      routes: [
        // 编辑器
        {
          path: '/',
          exact: true,
          title: '编辑器',
          component: '@/pages/main/index',
        },
        // 登录页
        {
          path: '/login',
          title: '登录',
          component: '@/pages/login',
        },
        // 直接运行场景
        {
          path: '/stage/:project',
          title: '展览',
          component: '@/pages/stage/exhibit',
        },
        {
          title: '404',
          component: '@/pages/error/404',
        },
      ],
    },
  ],
  fastRefresh: {},
  locale: {
    default: 'zh-CN',
    antd: true,
    // 默认为true。为true时，会使用`navigator.language`覆盖默认。为false时，则使用默认语言
    baseNavigator: false,
  },
  theme: {
    'primary-color': '#4c4c4c',
    'border-color-base': '#d9d9d9', // 边框色"
    'component-background': '#dddddd',
  },
});
