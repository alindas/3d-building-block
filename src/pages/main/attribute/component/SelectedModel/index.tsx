import { connect } from 'umi';
import style from './index.less';

function SelectedModel(props: any) {
  return (
    <div className={style['selected-wp']}>
      <h1 className={style['selected-name']}>
        {props.selectedModel == null ? '空对象' : props.selectedModel.name}
      </h1>
      {props.children}
      <div
        className={style['selected-mask']}
        style={props.selectedModel == null ? { height: '150%' } : {}}
      ></div>
    </div>
  );
}

export default connect((state: any) => ({
  selectedModel: state.scene.selectedModel,
}))(SelectedModel);
