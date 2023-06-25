import ToolBar from './component/ToolBar';
import Workbench from './component/Workbench';
import styles from './index.less';

function Scene(props) {
  const runState = props.runState;

  return (
    <div className={styles['scene-wrapper']}>
      {!window.location.pathname.includes('/runTD') && !runState && (
        <div className={styles['toolbar']}>
          <ToolBar />
        </div>
      )}
      <div
        className={styles['workbench']}
        style={{ height: runState && '100vh' }}
      >
        <Workbench />
      </div>
    </div>
  );
}

export default Scene;
