import React, { useState } from 'react';
import { connect } from 'umi';
import { Button } from 'antd';

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
  const { dispatch, canRun } = props;
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

  // 本地运行
  function localRun() {
    dispatch({
      type: 'scene/changeRunState',
      payload: true,
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
      <div className={style['run-btn']}>
        <Button
          type="primary"
          size="small"
          onClick={localRun}
          disabled={!canRun}
        >
          运行
        </Button>
      </div>
    </div>
  );
}

export default connect((s: any) => ({
  canRun: s.project.projectInfo !== null,
}))(ToolBar);
