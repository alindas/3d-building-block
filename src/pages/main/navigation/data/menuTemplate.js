import newProject from '../utils/newProject';
import SubMenu from '../component/SubMenu';
import MenuItem from '../component/MenuItem';
import exportProject from '../utils/exportProject';
import { showGuide, showAbout } from '../component/Helper';
import { showService, showScript } from '../component/Data';

function importProject() {
  document.getElementById('import-btn').click();
}

function saveProject() {
  exportProject('save');
}

function exportProj() {
  exportProject('export');
}

function handleLeftSideBar() {
  const node = document.querySelector('.mainContent-wrap-tree');
  if (node.style.width === '') {
    node.style.width = '0px';
  } else {
    node.style = '';
  }
}

function handleRightSideBar() {
  const node = document.querySelector('.mainContent-wrap-attribute');
  if (node.style.width === '') {
    node.style.width = '0px';
  } else {
    node.style = '';
  }
}

function handleFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

// 顶部菜单栏数据
const MenuTemplate = [
  {
    text: '文件',
    menu: (
      <SubMenu
        items={[
          {
            key: 'newProject',
            label: (
              <MenuItem
                onclick={newProject}
                text="新建工程"
                shortcut="Shift+N"
              />
            ),
          },
          {
            key: 'importProject',
            label: (
              <MenuItem
                onclick={importProject}
                text="导入工程"
                shortcut="Shift+K"
              />
            ),
          },
          {
            key: 'saveProject',
            label: (
              <MenuItem onclick={saveProject} text="保存" shortcut="Shift+S" />
            ),
          },
          {
            key: 'exportProject',
            label: (
              <MenuItem onclick={exportProj} text="导出" shortcut="Shift+E" />
            ),
          },
        ]}
      />
    ),
  },
  {
    text: '视图',
    menu: (
      <SubMenu
        items={[
          {
            key: 'fullScreen',
            label: <MenuItem onclick={handleFullScreen} text="全屏" />,
          },
          {
            key: 'leftSidebar',
            label: (
              <MenuItem
                onclick={handleLeftSideBar}
                text="资产栏"
                shortcut="Shift+B"
              />
            ),
          },
          {
            key: 'rightSidebar',
            label: (
              <MenuItem
                onclick={handleRightSideBar}
                text="属性栏"
                shortcut="Shift+R"
              />
            ),
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
            key: 'service',
            label: (
              <MenuItem onclick={showService} text="云端" shortcut="Shift+C" />
            ),
          },
          {
            key: 'script',
            label: (
              <MenuItem onclick={showScript} text="脚本" shortcut="Shift+J" />
            ),
          },
        ]}
      />
    ),
  },
  {
    text: '帮助',
    menu: (
      <SubMenu
        items={[
          {
            key: 'about',
            label: (
              <MenuItem onclick={showAbout} text="关于" shortcut="Shift+A" />
            ),
          },
          {
            key: 'help',
            label: (
              <MenuItem onclick={showGuide} text="手册" shortcut="Shift+H" />
            ),
          },
        ]}
      />
    ),
  },
];

document.addEventListener('keypress', (e) => {
  if (e.shiftKey) {
    switch (e.key) {
      case 'N': {
        newProject();
        break;
      }

      case 'K': {
        importProject();
        break;
      }

      case 'S': {
        saveProject();
        break;
      }

      case 'E': {
        exportProj();
        break;
      }

      case 'B': {
        handleLeftSideBar();
        break;
      }

      case 'R': {
        handleRightSideBar();
        break;
      }

      case 'C': {
        showService();
        break;
      }

      case 'J': {
        showScript();
        break;
      }

      case 'A': {
        showAbout();
        break;
      }

      case 'H': {
        showGuide();
        break;
      }

      default:
        break;
    }
  }
});

export default MenuTemplate;
