import React, { useState, useMemo } from 'react';
import { Modal, ModalProps, Space } from 'antd';
import {
  ExpandOutlined,
  CloseOutlined,
  CompressOutlined,
  HolderOutlined,
} from '@ant-design/icons';

import styles from './index.module.less';

export interface IPreviewModal extends ModalProps {
  type?: 'file' | 'video' | 'none';
  height?: number | string;
  drag?: boolean;
}

/**
 * 文件预览对话框
 */
const PreviewModal: React.FC<IPreviewModal> = (props) => {
  const {
    children,
    title,
    width = 980,
    type = 'none',
    drag = false,
    onCancel,
    ...restProps
  } = props;

  const [isFull, setIsFull] = useState(false);

  const uuid = useMemo(
    () =>
      /* eslint-disable */
      `model_${String(new Date().valueOf())}`,
    [],
  );

  const handleCancel = (e: any) => {
    if (isFull) {
      setIsFull(false);
    } else {
      onCancel?.(e);
    }
  };

  const handleCancelByIcon = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (isFull) {
      setTimeout(() => setIsFull(false), 300);
    }
    onCancel?.(e);
  };

  // 拖拽响应事件
  const handleDragDown = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!drag) {
      // 未开启 drag
      return;
    } else {
      const initX = e.screenX;
      const initY = e.screenY;
      const dom = document.querySelector(`.${uuid}`) as HTMLElement;
      const top = dom.offsetTop;
      const left = isFull
        ? initX -
          (typeof width == 'number'
            ? width
            : (window.screen.width * parseFloat(width)) / 100) /
            2
        : dom.offsetLeft;
      dom.style.top = top + 'px';
      dom.style.left = left + 'px';
      dom.style.margin = '0px';
      // console.log(top, left);

      document.onmousemove = (ev) => {
        if (isFull && (ev.screenX - initX > 10 || ev.screenY - initY > 10)) {
          setIsFull(false);
        }
        dom.style.left = left + ev.screenX - initX + 'px';
        dom.style.top = top + ev.screenY - initY + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  };

  const tagClass =
    type == 'file'
      ? `${styles['tag']} ${styles['file-tag']}`
      : `${styles['tag']} ${styles['video-tag']}`;

  const fullClass = isFull
    ? `${uuid} ${styles['preview-modal']} ${styles['full-screen']}`
    : `${uuid} ${styles['preview-modal']}`;

  return (
    <Modal
      width={isFull ? '100vw' : width}
      {...restProps}
      className={fullClass}
      footer={null}
      closable={false}
      onCancel={handleCancel}
    >
      <div
        className={styles['preview-modal-wp']}
        style={isFull ? { height: 'calc(100vh - 2px)' } : {}}
      >
        <div
          className={styles['preview-modal-head']}
          onMouseDown={handleDragDown}
        >
          <div className={styles['preview-modal-head-title']}>
            {type == 'none' ? (
              <div>
                <HolderOutlined />
              </div>
            ) : (
              <div className={tagClass}>{type == 'file' ? '文档' : '视频'}</div>
            )}
            <div className={styles['title-text']}>{title}</div>
          </div>
          <div className={styles['preview-modal-head-options']}>
            <Space size="middle">
              <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setIsFull(!isFull)}
              >
                {isFull ? <CompressOutlined /> : <ExpandOutlined />}
              </div>
              <CloseOutlined
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleCancelByIcon}
              />
            </Space>
          </div>
        </div>
        <div
          className={styles['preview-modal-body']}
          style={props.height && !isFull ? { height: props.height } : {}}
        >
          <div className={`${styles['preview-modal-container']} classModal`}>
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// PreviewModal.info = (props: ModalFuncProps) => confirm({
//   ...props,
//   type: 'info',
//   okText: '保存',
//   className: styles['preview-modal']
// })

export default PreviewModal;
