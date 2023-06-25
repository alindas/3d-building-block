import React from 'react';
import { Menu } from 'antd';
import styles from './index.less';

type SubMenuItem = {
  key: string;
  label: React.ReactNode;
};

export default function SubMenu(props: { items: SubMenuItem[] }) {
  return <Menu className={styles.SubMenu} theme="dark" items={props.items} />;
}
