/**
 * @description 路由守卫组件
 * */
import { Redirect, useLocation } from 'react-router-dom';

const AuthRouter = ({ children }: any) => {
  const { pathname } = useLocation();

  if (localStorage.getItem('token') && pathname === '/login') {
    return <Redirect to="/" />;
  }

  if (pathname === '/login') {
    return children;
  }

  // 无登录情况下可以访问 stage
  if (!localStorage.getItem('token')) {
    if (/^\/stage/.test(pathname)) {
      return children;
    } else {
      return <Redirect to="/login" />;
    }
  }

  return children;
};

export default AuthRouter;
