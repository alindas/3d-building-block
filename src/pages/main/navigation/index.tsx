import styles from './index.less';

import Menu from './component/Menu/index';
import Avatar from './component/Avatar/index';
import ImpFiles from './component/ImpFiles/index';

import MenuTemplate, {
  cancelShortcut,
  registerShortcut,
} from './data/menuTemplate';
import ProjectName from './component/ProjectName';
import { useEffect } from 'react';

export default function Navigation() {
  useEffect(() => {
    registerShortcut();

    return () => {
      cancelShortcut();
    };
  }, []);

  return (
    <div className={styles.navigation}>
      {/* 登录用户 */}
      <div className={styles.userImgDiv}>
        <Avatar></Avatar>
      </div>

      {/* 菜单栏 */}
      <div className={styles.menuList}>
        {MenuTemplate.map((item) => {
          return (
            <Menu menu={item.menu} text={item.text} key={item.text}></Menu>
          );
        })}
      </div>
      {/* 工程名 */}
      <ProjectName></ProjectName>
      {/* 导入按钮 */}
      <ImpFiles></ImpFiles>
    </div>
  );
}
