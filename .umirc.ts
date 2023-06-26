import { defineConfig } from 'umi';

export default defineConfig({
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
        { path: '/', exact: true, component: '@/pages/main/index' },
        // 直接运行场景
        {
          path: '/stage/:project',
          component: '@/pages/stage/exhibit',
        },
        {
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
});
