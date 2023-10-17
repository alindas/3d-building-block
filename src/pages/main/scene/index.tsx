import ErrorBoundary from '@/components/ErrorBoundary';
import SafetyPants from '@/components/SafetyPants';
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
        <ErrorBoundary FallbackComponent={SafetyPants}>
          <Workbench />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default Scene;
