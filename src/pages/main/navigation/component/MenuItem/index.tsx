import React, { useEffect } from 'react';
import style from './index.less';

interface IMenuItem {
  text: string;
  shortcut: string;
  onclick: () => void;
}

export default function MenuItem(props: IMenuItem) {
  return (
    <span onClick={props.onclick} className={style.menuItem}>
      <span>{props.text}</span>
      <span>{props.shortcut}</span>
    </span>
  );
}
