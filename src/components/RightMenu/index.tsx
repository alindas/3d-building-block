import React, { useMemo } from 'react';

import style from './index.less';

export type TMenuItem = {
  key: number | string;
  label: string;
  onClick?: (e) => void;
  icon?: React.ReactNode;
  children?: TMenuItem[];
};

export interface IRightMenu {
  visiblity: boolean;
  position: [number, number];
  menuItems: TMenuItem[];
  classnames?: string;
}

export default function RightMenu(props: IRightMenu) {
  const { visiblity, position, menuItems, classnames = '' } = props;

  const [x, y] = position;

  function renderMenu(data: TMenuItem[]) {
    return (
      <ul>
        {data.map((menu) => (
          <li
            onClick={(e) => {
              e.stopPropagation();
              menu.onClick && menu.onClick(e);
            }}
            key={menu.key}
          >
            <span className={style['icons']}>{menu.icon ?? ''}</span>
            <span>&nbsp;&nbsp;{menu.label}</span>
            <div className={style['menu-item-child']}>
              {menu.children && renderMenu(menu.children)}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const menuItemRender = useMemo(() => renderMenu(menuItems), [menuItems]);

  return (
    <div
      className={`${style['right-menu-wrapper']} ${
        visiblity && style['right-menu-wrapper-show']
      } ${classnames}`}
      style={{ top: y, left: x + 20 }}
    >
      {menuItemRender}
    </div>
  );
}
