import React from 'react';
import style from './404.less';

const NotFoundPage = () => {
  return (
    <div className={style.container}>
      <h1>404 - 页面未找到</h1>
      <p>抱歉，您所访问的页面不存在。</p>
      <p>
        返回 <a href="/">首页</a>
      </p>
    </div>
  );
};

export default NotFoundPage;
