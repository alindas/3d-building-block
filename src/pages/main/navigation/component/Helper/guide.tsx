import React from 'react';
import style from './index.less';
import helper from './helper.json';

export default function Guide() {
  return (
    <div>
      <div className={style['readme-wrapper']}>
        {helper.map((o) => (
          <div className={style['readme']} key={o.desc}>
            <div className={style['readme-item']}>
              <span>{o.desc}</span>
              <span>{o.ops}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
