let db_config: any = {};

export default {
  // 支持值为 Object 和 Array
  'GET /api/users': { users: [1, 2] },

  // GET 可忽略
  '/api/users/1': { id: 1 },

  // 支持自定义函数，API 参考 express@4
  'POST /api/users/create': (req: any, res: any) => {
    // 添加跨域请求头
    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('ok');
  },

  // public 模型
  '/api/model': (req: any, res: any) => {
    const project = req.query?.project;
    if (project in db_config) {
      res.send(JSON.stringify(db_config[project])); // 返回对应工程的 config 数据
    } else {
      res.end('no exit');
    }
  },

  // 保存工程配置，用indexDB 作演示
  'POST /api/save': (req: any, res: any) => {
    const { project, data } = req.body;
    res.end('ok');
  },
};
