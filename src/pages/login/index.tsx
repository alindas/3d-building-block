import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Form, Input, Spin, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import style from './index.less';

const Login = () => {
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const loginName = localStorage.getItem('user');
    form.setFieldsValue({
      name: loginName,
    });
  }, []);

  const toLogin = () => {
    form.validateFields().then((value) => {
      // 模拟的。todo login
      setLoading(true);
      localStorage.setItem('user', value.name);
      localStorage.setItem('token', new Date().valueOf() + '');
      setTimeout(() => {
        message.success('登录成功');
        history.push('/');
        setLoading(false);
      }, 1000);
    });
  };

  return (
    <div className={style.loginContainer}>
      <Spin tip="登录中，请稍等..." spinning={loading}>
        <div className={style.contentBox}>
          <div className={style.loginBox}>
            <div className={style.loginTitle}>
              <div className={style.login}>
                <span>登录</span>
              </div>
              <div className={style.welcome}>
                <span>欢迎使用</span>
              </div>
            </div>
            <div className={style.formBox}>
              <Form form={form} name="login_form" layout="vertical">
                <span className={style.span}>账号</span>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      pattern: /^[a-zA-Z0-9]{4,10}$/,
                      message: '4-10位数字或字母',
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    className={style.loginInput}
                    prefix={<UserOutlined />}
                    placeholder="请输入账号"
                    autoComplete="off"
                    onPressEnter={toLogin}
                  />
                </Form.Item>
                <span className={style.span}>密码</span>
                <Form.Item
                  name="pwd"
                  rules={[
                    {
                      required: true,
                      pattern: /^\S{4,20}$/,
                      message: '6-20位非空字符',
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    className={style.loginInput}
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    autoComplete="off"
                    onPressEnter={toLogin}
                  />
                </Form.Item>
              </Form>
              <div className={style.loginBtn} onClick={toLogin}>
                登 录
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Login;
