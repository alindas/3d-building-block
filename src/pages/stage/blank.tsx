import CT1 from '@/components/Effect/CT1';
import style from './index.less';

const BlankPage = () => {
  return (
    <div className={style['blank-wrapper']}>
      <CT1 />
      <h1 className={style['blank-msg']}>场景未开放</h1>
    </div>
  );
};

export default BlankPage;
