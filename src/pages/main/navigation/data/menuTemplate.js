import newProject from '../utils/newProject';
import SubMenu from '../component/SubMenu/index.tsx';
import exportProject from '../utils/exportProject';

// 顶部菜单栏数据
const MenuTemplate = [
  {
    text: '文件',
    menu: (
      <SubMenu
        items={[
          {
            key: 'newProject',
            label: <span onClick={newProject}>新建工程</span>,
          },
          {
            key: 'importProject',
            label: (
              <span
                onClick={() => document.getElementById('import-btn').click()}
              >
                导入工程
              </span>
            ),
          },
          {
            key: 'saveProject',
            label: <span onClick={() => exportProject('save')}>保存</span>,
          },
          {
            key: 'exportProject',
            label: <span onClick={() => exportProject('export')}>导出</span>,
          },
        ]}
      />
    ),
  },
  {
    text: '设置',
    menu: (
      <SubMenu
        items={[
          {
            key: 'setup1',
            label: '选项1',
          },
          {
            key: 'setup2',
            label: '选项2',
          },
        ]}
      />
    ),
  },
  {
    text: '编辑',
    menu: (
      <SubMenu
        items={[
          {
            key: 'edit1',
            label: '选项1',
          },
          {
            key: 'edit2',
            label: '选项2',
          },
        ]}
      />
    ),
  },
  {
    text: '语言',
    menu: (
      <SubMenu
        items={[
          {
            key: 'lang1',
            label: '选项1',
          },
          {
            key: 'lang2',
            label: '选项2',
          },
        ]}
      />
    ),
  },
  {
    text: '数据',
    menu: (
      <SubMenu
        items={[
          {
            key: 'data1',
            label: '选项1',
          },
          {
            key: 'data2',
            label: '选项2',
          },
        ]}
      />
    ),
  },
  {
    text: '账户',
    menu: (
      <SubMenu
        items={[
          {
            key: 'user1',
            label: '选项1',
          },
          {
            key: 'user2',
            label: '选项2',
          },
        ]}
      />
    ),
  },
];

export default MenuTemplate;
