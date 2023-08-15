import axios from 'axios';
import { backend } from './ipConfig';

const request = axios.create({
  baseURL: backend,
  timeout: 5000,
});

axios.defaults.withCredentials = false;

// 请求前拦截
request.interceptors.request.use(
  (config) => {
    // todo 自定义拦截操作
    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);

// 返回后拦截
request.interceptors.response.use(
  (response) => {
    // todo 自定义过滤操作
    return response.data;
  },
  (err) => {
    return Promise.reject(err);
  },
);

export default request;
