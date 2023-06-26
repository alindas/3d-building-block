import ToolBar from './component/ToolBar';
import Workbench from './component/Workbench';
import styles from './index.less';

function Scene() {
  return (
    <div className={styles['scene-wrapper']}>
      <div className={styles['toolbar']}>
        <ToolBar />
      </div>
      <div className={styles['workbench']}>
        <Workbench />
      </div>
    </div>
  );
}

export default Scene;
