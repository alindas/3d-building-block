import React from 'react';
import styles from './index.less';

import { Dropdown } from 'antd';

export default function Menu(props: any) {
  const { text, menu } = props;
  // todo 开启一次菜单栏后，其余唤醒改为 hover
  return (
    <div className={styles.Menu}>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
        <span className={styles.text}>{text}</span>
      </Dropdown>
    </div>
  );
}
