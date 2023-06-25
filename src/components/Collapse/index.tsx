import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Draggable } from 'react-beautiful-dnd';

import style from './index.less';
import holderOutlined from '@/assets/holderOutlined.png';
import { createClassnames } from '@/utils/common';

export interface ICollpose {
  title: string;
  children: any;
  height?: number | string; // 自定义设定高度
  dragId?: number; // 用于标识拖拽控件，默认 undefined 时标识该控件不能进行拖拽
  defaultExpand?: boolean; // 是否默认展开
  onChange?: () => any; // 收起、展开动作的回调事件
}

function Collapse(props: ICollpose) {
  const dragId =
    typeof props.dragId == 'undefined'
      ? false
      : isNaN(props.dragId)
      ? false
      : props.dragId;

  const [ifExpand, setExpand] = useState(props.defaultExpand ?? false);
  const [dynamicHeight, setDynamicHeight] = useState('');

  const handleClick = () => {
    setExpand(!ifExpand);
    props.onChange && props.onChange();
  };

  useEffect(() => {
    if (typeof props.height != 'undefined') {
      setDynamicHeight(
        createClassnames({
          height:
            typeof props.height == 'number'
              ? `${props.height}px`
              : props.height,
          flex: 'none',
        }),
      );
    }
  }, []);

  return (
    <Draggable
      draggableId={props.title}
      index={dragId === false ? 0 : dragId}
      isDragDisabled={dragId === false}
      disableInteractiveElementBlocking={false}
    >
      {(provided) => (
        <div
          className={`${style['collapse-wrapper']} ${
            ifExpand
              ? `${style['collapse-wrapper-open']} ${dynamicHeight} `
              : ''
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div
            className={style['collapse-header']}
            style={ifExpand ? { borderRadius: '2px 2px 0 0' } : {}}
          >
            <div className={style['title']}>
              <img src={holderOutlined} />
              {props.title}
            </div>
            <div
              className={style['control']}
              contentEditable
              suppressContentEditableWarning
            >
              <DownOutlined
                style={ifExpand ? {} : { transform: 'rotate(-180deg)' }}
                onClick={handleClick}
              />
            </div>
          </div>
          <div
            className={style['collapse-body']}
            style={
              ifExpand
                ? { height: 'calc(100% - 1.75rem - 4px)' }
                : { height: 0, padding: 0 }
            }
            contentEditable
            suppressContentEditableWarning
          >
            <div contentEditable={false}>{props.children}</div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default React.memo(Collapse);
