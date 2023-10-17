import { defineConfig } from 'umi';

export default defineConfig({
  favicon: '/favicon.ico',
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
  // mfsu: {},
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
  dynamicImport: {
    loading: '@/components/Spin',
  },
  chunks: ['lodash', 'antd', 'three', 'vendors', 'umi'],
  chainWebpack(memo) {
    memo.optimization.splitChunks({
      chunks: 'async', //async异步代码分割 initial同步代码分割 all同步异步分割都开启
      automaticNameDelimiter: '.',
      name: true,
      minSize: 30000, // 引入的文件大于30kb才进行分割
      //maxSize: 50000, // 50kb，尝试将大于50kb的文件拆分成n个50kb的文件
      minChunks: 1, // 模块至少使用次数
      // maxAsyncRequests: 5,    // 同时加载的模块数量最多是5个，只分割出同时引入的前5个文件
      // maxInitialRequests: 3,  // 首页加载的时候引入的文件最多3个
      // name: true,             // 缓存组里面的filename生效，覆盖默认命名
      cacheGroups: {
        three: {
          name: 'three',
          test: /[\\/]node_modules[\\/]three[\\/]/,
          priority: -1,
        },
        antd: {
          name: 'antd',
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          priority: -5,
        },
        lodash: {
          name: 'lodash',
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          priority: -2,
        },
        vendors: {
          name: 'vendors',
          test({ resource }: { resource: string }) {
            return /[\\/]node_modules[\\/]/.test(resource);
          },
          priority: -10,
        },
      },
    }),
      //过滤掉momnet的那些不使用的国际化文件
      memo
        .plugin('replace')
        .use(require('webpack').ContextReplacementPlugin)
        .tap(() => {
          return [/moment[/\\]locale$/, /zh-cn/];
        });
  },
});
