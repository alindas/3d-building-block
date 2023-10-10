import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import { Button, Modal, message } from 'antd';
import classnames from 'classnames';

import style from './index.less';
import revokeBtn from '@/assets/tool-bar/revokeBtn.png';
import redoBtn from '@/assets/tool-bar/redoBtn.png';
import selectBtn from '@/assets/tool-bar/selectBtn.png';
import translateBtn from '@/assets/tool-bar/translateBtn.png';
import scaleBtn from '@/assets/tool-bar/scaleBtn.png';
import rotateBtn from '@/assets/tool-bar/rotateBtn.png';
import focusBtn from '@/assets/tool-bar/focusBtn.png';
import rectBtn from '@/assets/tool-bar/rectBtn.png';
import curveBtn from '@/assets/tool-bar/curveBtn.png';
import exportProject from '@/pages/main/navigation/utils/exportProject';
import request from '@/service/request';

type TOptionMenu = {
  key: string;
  title: string;
  icon: React.ReactNode;
  click: () => any;
};

function ToolBar(props: any) {
  const { dispatch, project, transformControlMode } = props;
  const rf = useState(false)[1];
  const [open, setOpen] = useState(false);

  const OptionGroup: TOptionMenu[][] = [
    [
      {
        key: 'revoke',
        title: '撤回',
        icon: <img src={revokeBtn} />,
        click: () => window.cmd.backup(),
      },
      {
        key: 'redo',
        title: '重做',
        icon: <img src={redoBtn} />,
        click: () => window.cmd.forward(),
      },
    ],
    [
      {
        key: 'disable',
        title: '选择对象',
        icon: <img src={selectBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'disable',
          }),
      },
      {
        key: 'translate',
        title: '选择并移动',
        icon: <img src={translateBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'translate',
          }),
      },
      {
        key: 'scale',
        title: '选择并缩放',
        icon: <img src={scaleBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'scale',
          }),
      },
      {
        key: 'rotate',
        title: '选择并旋转',
        icon: <img src={rotateBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'rotate',
          }),
      },
      {
        key: 'focus',
        title: '最大化显示选定对象',
        icon: <img src={focusBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'focus',
          }),
      },
    ],
    [
      {
        key: 'selectRect',
        title: '框选对象-矩形',
        icon: <img src={rectBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'selectRect',
          }),
      },
      {
        key: 'selectCurve',
        title: '框选对象-曲线',
        icon: <img src={curveBtn} />,
        click: () =>
          dispatch({
            type: 'scene/modifyTransformControlMode',
            payload: 'selectCurve',
          }),
      },
    ],
  ];

  useEffect(() => {
    // 监听状态更新
    window.cmd.onChange = () => rf((f) => !f);
  }, []);

  // 后续可能多个地方需要，eg: 工程导出时
  async function uploadProject() {
    // maybe 需要先 check 是否需要更新工程
    setOpen(true);
    // todo 上传工程信息，在回调里打开新访问窗口
    await exportProject('save');
    request
      .post('test/updateProject', { projectId: window.projectId, open: true })
      .then(() => {
        dispatch({
          type: 'project/updateProject',
          payload: {
            projectInfo: {
              ...project,
              open: true,
            },
          },
        });
        window.open(`/stage/${window.projectId}`, '_blank');
      })
      .catch(() => {
        message.error('工程发布失败');
      });
  }

  // 执行运行全屏展示界面
  function localRun() {
    // 已开启是否终止
    if (open) {
      Modal.confirm({
        title: '复制链接访问查看',
        content: (
          <span style={{ color: '#1b92ff' }}>
            {location.origin}/stage/{window.projectId}
          </span>
        ),
        transitionName: '',
        cancelText: '取消发布',
        onCancel: () => {
          request
            .post('test/updateProject', {
              projectId: window.projectId,
              open: false,
            })
            .then(() => {
              dispatch({
                type: 'project/updateProject',
                payload: {
                  projectInfo: {
                    ...project,
                    open: false,
                  },
                },
              });
              setOpen(false);
            })
            .catch(() => {
              message.error('工程发布失败');
            });
        },
      });

      return;
    }
    // 生成场景访问 key，用于对外展示。todo: 上云
    Modal.confirm({
      title: '上传工程到云端，并开放该展示地址',
      content: (
        <span>
          展示地址：
          <span style={{ color: '#1b92ff' }}>
            {location.origin}/stage/{window.projectId}
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
          onClick={item.click}
          className={classnames({
            [style['negative-btn']]: index === 0,
            [style['active-btn']]:
              index === 0 &&
              ((item.key === 'revoke' && window.cmd.canBack) ||
                (item.key === 'redo' && window.cmd.canForward)),
            [style['selected-btn']]:
              index > 0 && transformControlMode === item.key,
          })}
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
          disabled={window.projectId === -1}
        >
          {open ? '展示地址' : '发布'}
        </Button>
      </div>
    </div>
  );
}

export default connect((s: any) => ({
  project: s.project.projectInfo,
  transformControlMode: s.scene.transformControlMode,
}))(ToolBar);
