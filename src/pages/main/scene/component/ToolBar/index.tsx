import React, { useState } from 'react';
import { connect } from 'umi';
import { Button, Modal } from 'antd';

import style from './index.less';
import revokeBtn from '@/assets/tool-bar/revokeBtn.png';
import redoBtn from '@/assets/tool-bar/redoBtn.png';
import selectBtn from '@/assets/tool-bar/selectBtn.png';
import translateBtn from '@/assets/tool-bar/translateBtn.png';
import scaleBtn from '@/assets/tool-bar/scaleBtn.png';
import rotateBtn from '@/assets/tool-bar/rotateBtn.png';
import focusBtn from '@/assets/tool-bar/focusBtn.png';

type TOptionMenu = {
  key: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => any;
};

function ToolBar(props: any) {
  const { dispatch, project, runState } = props;
  const [selectedMenu, setSelectedMenu] = useState(['', 'select']);

  function demo() {
    console.log('demo');
  }

  const OptionGroup = [
    [
      {
        key: 'revoke',
        title: '撤回',
        icon: <img src={revokeBtn} />,
        onClick: demo,
      },
      {
        key: 'redo',
        title: '重做',
        icon: <img src={redoBtn} />,
        onClick: demo,
      },
    ],
    [
      {
        key: 'select',
        title: '选择对象',
        icon: <img src={selectBtn} />,
        onClick: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'disable',
          }),
      },
      {
        key: 'translate',
        title: '选择并移动',
        icon: <img src={translateBtn} />,
        onClick: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'translate',
          }),
      },
      {
        key: 'scale',
        title: '选择并缩放',
        icon: <img src={scaleBtn} />,
        onClick: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'scale',
          }),
      },
      {
        key: 'rotate',
        title: '选择并旋转',
        icon: <img src={rotateBtn} />,
        onClick: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'rotate',
          }),
      },
      {
        key: 'focus',
        title: '最大化显示选定对象',
        icon: <img src={focusBtn} />,
        onClick: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'focus',
          }),
      },
    ],
  ];

  function handleMenuClick(groupId: number, menu: TOptionMenu) {
    selectedMenu[groupId] = menu.key;
    setSelectedMenu([...selectedMenu]);
    menu.onClick();
  }

  // 后续可能多个地方需要，eg: 工程导出时
  function uploadProject() {
    // maybe 需要先 check 是否需要更新工程
    dispatch({
      type: 'scene/changeRunState',
      payload: true,
    });
    // todo 上传工程信息，在回调里打开新访问窗口
    window.open(`/stage/${project.name}`, '_blank');
  }

  // 执行运行全屏展示界面
  function localRun() {
    // 已开启是否终止
    if (runState) {
      dispatch({
        type: 'scene/changeRunState',
        payload: false,
      });
      return;
    }
    // 生成场景访问 key，用于对外展示。todo: 上云
    Modal.confirm({
      title: '上传工程到云端，并开放该展示地址',
      content: (
        <span>
          展示地址：
          <span>
            {location.origin}/stage/{project.name}
          </span>
        </span>
      ),
      transitionName: '',
      onOk: () => {
        // 保存当前工作台，导入新工程
        uploadProject();
      },
    });
  }

  const renderOptionGroup = OptionGroup.map((group, index) => (
    <div className={style['option-box-group']} key={index}>
      {group.map((item) => (
        <button
          key={item.key}
          title={item.title}
          onClick={() => handleMenuClick(index, item)}
          className={
            index == 1 && selectedMenu[index] == item.key
              ? style['selected-btn']
              : ''
          }
          // style={}
        >
          {item.icon}
        </button>
      ))}
    </div>
  ));

  return (
    <div className={style['toolbar-wrapper']}>
      <div className={style['option-box']}>{renderOptionGroup}</div>
      <div className={style['run-btn']} title="自定义展示">
        <Button
          type="primary"
          size="small"
          onClick={localRun}
          disabled={project === null}
        >
          {runState ? '取消运行' : '运行'}
        </Button>
      </div>
    </div>
  );
}

export default connect((s: any) => ({
  project: s.project.projectInfo,
  runState: s.scene.runState,
}))(ToolBar);
