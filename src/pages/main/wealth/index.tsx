import React, { useEffect, useState } from 'react';

import Collapse from '@/components/Collapse';
import RelationshipEditor from './component/RelationshipEditor';
import style from './index.less';

const Wealth = (props: any, ref: any) => {
  const { sequence, onSort, ...dragProps } = props;

  // 用于给某些需要获知外层 collapse 包装器是否收起或展开的子组件
  const [wrapperHeightChangeTrigger, setWrapperHeightChangeTrigger] =
    useState(false);

  useEffect(() => {
    try {
      let record = JSON.parse(localStorage.getItem('wealth') ?? '[]');
      onSort(Array.from(new Set([...record, '模型库', '模型'])));
    } catch (error) {
      localStorage.removeItem('wealth');
      onSort(['模型库', '模型']);
    }
  }, []);

  return (
    <div className={style['tree-wrapper']} ref={ref} {...dragProps}>
      {sequence.map((item: string, index: number) => {
        switch (item) {
          case '模型库': {
            return (
              <Collapse
                title="模型库"
                dragId={index}
                key={item}
                onChange={() =>
                  setWrapperHeightChangeTrigger(!wrapperHeightChangeTrigger)
                }
              >
                空
              </Collapse>
            );
          }
          case '模型': {
            return (
              <Collapse
                title="模型"
                dragId={index}
                key={item}
                onChange={() =>
                  setWrapperHeightChangeTrigger(!wrapperHeightChangeTrigger)
                }
                defaultExpand
              >
                <RelationshipEditor
                  changeTrigger={wrapperHeightChangeTrigger}
                />
              </Collapse>
            );
          }
          default:
            return null;
        }
      })}

      {props.children}
    </div>
  );
};

export default React.forwardRef(Wealth);
