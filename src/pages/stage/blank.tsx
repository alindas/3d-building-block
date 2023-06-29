import CT1 from '@/components/Effect/CT1';
import style from './index.less';

const BlankPage = (props: { msg: string }) => {
  return (
    <div className={style['blank-wrapper']}>
      <CT1 />
      <h1 className={style['blank-msg']}>{props.msg ?? '空白页'}</h1>
    </div>
  );
};

export default BlankPage;
