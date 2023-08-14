import React, { useState } from 'react';
import { Modal } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import exportProject from '../../utils/exportProject';

const UserInfo = new String(
  localStorage.getItem('token') + '',
)[0].toLocaleUpperCase();

export default function Avatar() {
  const history = useHistory();
  const [info, setInfo] = useState<React.ReactNode>(UserInfo);

  function confirmLogout() {
    Modal.confirm({
      title: '确认退出',
      content: <p>尚未保存的工程信息会被自动保存</p>,
      transitionName: '',
      cancelText: '取消',
      onOk: logout,
    });
  }

  async function logout() {
    await exportProject('save');
    localStorage.removeItem('token');
    history.push('/login');
  }

  return (
    <div
      onMouseEnter={() => setInfo(<LogoutOutlined rotate={180} />)}
      onMouseLeave={() => setInfo(UserInfo)}
      onClick={confirmLogout}
      style={{
        width: 32,
        height: 32,
        background: '#cccccc',
        color: '#fff',
        fontSize: '1rem',
        lineHeight: '32px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      {info}
    </div>
  );
}
