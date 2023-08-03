import React from 'react';

import model from './data.json';
import style from './index.less';

export default function ModelLibrary() {
  console.log(model);
  return (
    <div>
      {model.map((group) => (
        <div key={group.group}>
          <div className={style['asset-group']}>{group.group}</div>
          <div>
            {group.data.map((o) => (
              <div key={o.url} className={style['asset-item']}>
                <span className={style['asset-item-cover']}>
                  <img src={o.cover} alt={o.desc} />
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
