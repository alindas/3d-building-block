import { connect } from 'umi';
import { Checkbox } from 'antd';
import style from './index.less';
import Config from './Config';

function Setting(props: any) {
  function changeSaveMode(e: any) {
    window.autoSave = e.target.checked;
  }

  return (
    <div>
      <div className={style['set-panel']}>
        <div className={style['set-item']}>
          <div className={style['set-item-title']}>
            <div className={style['set-item-options']}>
              <span>配置文件</span>
              <Checkbox onChange={changeSaveMode} defaultChecked={true}>
                自动保存
              </Checkbox>
            </div>
          </div>
          <div className={style['set-item-value']}>
            <div className={style['set-item-config']}>
              <Config />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect((state: any) => ({
  menuProject: state.project,
}))(Setting);
