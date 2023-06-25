// import {ip} from '../../services/address';
var ip = '172.22.19.45';
// const ipUrl = 'http://' + ip + ':8000/file?path=';

// const fileName = 'modelFile-test.json';
const fileName = 'main';
// const fileName = 'modelFile2.json';

let arr = window.location.href.split('/');

export const id =
  window.location.href.split('/')[window.location.href.split('/').length - 1];
export const enviroment =
  window.location.href.split('/')[window.location.href.split('/').length - 2];
var ipUrl;
if (/碰撞/.test(decodeURI(id))) {
  //  ipUrl = 'http://www.cncwww.cn' + ':8000?path=';
  if (/5G/.test(decodeURI(id))) {
    ipUrl = 'https://www.cncwww.cn' + ':8223?path=';
  } else {
    ipUrl = 'https://192.168.86.201' + ':8223?path=';
  }
} else {
  //  ipUrl = 'http://192.168.86.201' + ':8223?path=';
  ipUrl = 'http://' + ip + ':8000/file?path=';
  if (/国赛/.test(decodeURI(id))) {
    // ipUrl = 'http://' + 'cloud.gsk.com.cn' + ':8000/file?path=';
  }
}

export default ipUrl;

export function getConfigFile(name) {
  // console.log('zzzzzzz', id, enviroment)
  return fetch(`${ipUrl}${id || fileName || name}`, { method: 'GET' })
    .then((data) => data.json())
    .then((data) => {
      return data;
    })
    .catch((error) => ({ error }));
}

export function putConfigFile(name, data) {
  return fetch(`${ipUrl}${id || fileName || name}`, {
    method: 'PUT',
    body: data,
  })
    .then((data) => data.text())
    .then((data) => data)
    .catch((error) => error);
}
