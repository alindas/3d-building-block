import React, { useState } from 'react';
import { Modal } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import exportProject from '../../utils/exportProject';
import { useDispatch } from 'umi';

export default function Avatar() {
  const UserInfo = new String(
    localStorage.getItem('user') + '',
  )[0].toLocaleUpperCase();

  const history = useHistory();
  const dispatch = useDispatch();
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

  function clearCache() {
    dispatch({
      type: 'scene/clear',
    });
    dispatch({
      type: 'project/clear',
    });
    window.autoSave = true;
    window.projectId = -1;
    window.multiple = false;
  }

  async function logout() {
    await exportProject('save');
    clearCache();
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
