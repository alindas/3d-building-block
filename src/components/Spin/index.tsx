import React from 'react';
import style from './index.less';

interface SpinProps {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Spin: React.FC<SpinProps> = (props) => {
  const { loading = true, size = 'medium' } = props;

  const layoutClasses = `${style.container} ${style.center}`;
  const orbitClasses = `${style.orbitSpinner} ${style[`${size}_orbit`]}`;

  return (
    <div className={style.wrapper}>
      {loading ? (
        <div className={layoutClasses}>
          <div className={style.loading}>
            <div className={orbitClasses}>
              <span className={style.orbit}></span>
              <span className={style.orbit}></span>
              <span className={style.orbit}></span>
            </div>
          </div>
          <div>数据加载中</div>
        </div>
      ) : (
        props.children
      )}
      <div
        className={style.transitionMark}
        style={loading ? {} : { opacity: 0 }}
      ></div>
    </div>
  );
};

export default React.memo(Spin);
