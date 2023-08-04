import React from 'react';

import model from './data.json';
import style from './index.less';

export default function ModelLibrary() {
  function startDrag(url: string, type: string) {
    // 获取模型是真实资源地址，在编辑面板处响应
    window.modelUrl = {
      value: url,
      type,
    };
  }

  return (
    <div>
      {model.map((group) => (
        <div key={group.group}>
          <div className={style['asset-group']}>{group.group}</div>
          <div>
            {group.data.map((o) => (
              <div key={o.url} className={style['asset-item']}>
                <span className={style['asset-item-cover']}>
                  <img
                    src={o.cover}
                    alt={o.desc}
                    onMouseDown={() => startDrag(o.url, group.type)}
                  />
                </span>
                <span>{o.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
