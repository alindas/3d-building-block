import React, { useEffect } from 'react';

import Collapse from '@/components/Collapse';
import style from './index.less';
import DataBind from './component/DataBind';
import Editor from './component/Editor';
import SelectedModel from './component/SelectedModel';
import EnvConfig from './component/EnvConfig';

const Attribute = (props: any, ref: any) => {
  const { sequence, onSort, ...dragProps } = props;

  useEffect(() => {
    // 结合本地排序
    try {
      let record = JSON.parse(localStorage.getItem('attribute') ?? '[]');
      onSort(Array.from(new Set([...record, '属性', '环境'])));
    } catch (error) {
      localStorage.removeItem('attribute');
      onSort(['属性', '环境']);
    }
  }, []);

  return (
    <div className={style['config-wrapper']} ref={ref} {...dragProps}>
      {sequence.map((item: string, index: number) => {
        switch (item) {
          case '属性': {
            return (
              <Collapse title="属性" dragId={index} key={item} defaultExpand>
                <div className={style['model-config']}>
                  <SelectedModel>
                    <DataBind />
                    <Editor />
                  </SelectedModel>
                </div>
              </Collapse>
            );
          }
          case '环境': {
            return (
              <Collapse title="环境" dragId={index} key={item} defaultExpand>
                <div className={style['scene-config']}>
                  <EnvConfig />
                </div>
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

export default React.forwardRef(Attribute);
