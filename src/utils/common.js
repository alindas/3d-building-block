/**
 * 为某元素添加移动效果
 * @param {Event} e 鼠标事件
 * @param {ele} handler 拖拽的手柄
 * @param {ele} target 响应拖动效果的载体，缺失时以手柄作为目标载体
 */
export function handleMove(e, handler, target) {
  if (isEmpty(handler)) {
    // 未开启 drag
    console.error('未设置节点');
    return;
  } else {
    const initX = e.screenX;
    const initY = e.screenY;
    const dom = target || handler;
    const top = dom.offsetTop;
    const left = dom.offsetLeft;
    dom.style.top = top + 'px';
    dom.style.left = left + 'px';
    dom.style.margin = '0px';
    // console.log(top, left);

    document.onmousemove = (ev) => {
      dom.style.left = left + ev.screenX - initX + 'px';
      dom.style.top = top + ev.screenY - initY + 'px';
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }
}

/**
 * @param {*} file
 * @returns
 */
export function fileToBlob(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(new Blob([e.target.result], { type: file.type }));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  });
}

export function isEmpty(obj) {
  return typeof obj == 'undefined' || obj === null || obj === '';
}

// 创建 classnames
function createClassnames(styleObj) {
  const style = document.createElement('style');
  let classname;
  if (typeof crypto.randomUUID !== 'undefined') {
    classname = 'col' + crypto.randomUUID();
  } else {
    classname = 'col' + String(Math.random()).slice(2);
  }
  let styleTemplate = '';
  for (let key in styleObj) {
    styleTemplate += `${key}: ${styleObj[key]};\n`;
  }
  style.innerHTML = `
    .${classname} {
      ${styleTemplate}
    }
  `;

  document.querySelector('head').appendChild(style);

  return classname;
}

// 判断是否为整形
function isInteger(number) {
  return Math.floor(number) === number;
}

// 深拷贝
function deepClone(data) {
  if (!data || !(data instanceof Object) || typeof data === 'function') {
    return data;
  }
  var constructor = data.constructor;
  var result = new constructor();
  for (var key in data) {
    if (key in data) {
      result[key] = deepClone(data[key]);
    }
  }
  return result;
}

// 可判断对象内容是否相等
function isEqual(obj1, obj2) {
  if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) {
    /*  判断不是对象  */
    return obj1 === obj2;
  }
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
    //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,判断键值个数是否相等
  }
  for (var attr in obj1) {
    //逐个值进行判断
    if (obj1[attr] instanceof Object && obj2[attr] instanceof Object) {
      if (!isEqual(obj1[attr], obj2[attr])) return false;
    } else if (obj1[attr] !== obj2[attr]) {
      return false;
    }
  }
  return true;
}

/**
 * @describe 递归获取元素距离客户端四边的距离
 * @param ele 目标元素
 * @param direction 方位
 * @returns 对应的距离客户端边距
 */
const getClientXY = (ele, direction) => {
  let value1 = 0;
  let value2 = 0;
  let targetValue = [];
  let parent = ele.offsetParent;
  switch (direction) {
    case 'top': {
      value1 = ele.offsetTop;
      while (parent != null) {
        value1 += parent.offsetTop;
        parent = parent.offsetParent;
      }
      break;
    }

    case 'bottom': {
      value1 = ele.offsetTop;
      let top_offsetHeight = 0;
      while (parent != null) {
        value1 += parent.offsetTop;
        parent = parent.offsetParent;
        parent && (top_offsetHeight = parent.offsetHeight);
      }
      value1 = top_offsetHeight - value1 - ele.offsetHeight;
      break;
    }

    case 'left': {
      value1 = ele.offsetLeft;
      while (parent != null) {
        value1 += parent.offsetLeft;
        parent = parent.offsetParent;
      }
      break;
    }

    case 'right': {
      value1 = ele.offsetLeft;
      let top_offsetWidth = 0;
      while (parent != null) {
        value1 += parent.offsetLeft;
        parent = parent.offsetParent;
        parent && (top_offsetWidth = parent.offsetWidth);
      }
      value1 = top_offsetWidth - value1 - ele.offsetWidth;
      break;
    }

    case 'leftTop': {
      value1 = ele.offsetLeft;
      value2 = ele.offsetTop;
      while (parent != null) {
        value1 += parent.offsetLeft;
        value2 += parent.offsetTop;
        parent = parent.offsetParent;
      }
      break;
    }

    case 'leftBottom': {
      value1 = ele.offsetLeft;
      value2 = ele.offsetTop;
      let top_offsetHeight = 0;
      while (parent != null) {
        value1 += parent.offsetLeft;
        value2 += parent.offsetTop;
        parent = parent.offsetParent;
        parent && (top_offsetHeight = parent.offsetHeight);
      }
      value2 = top_offsetHeight - value2 - ele.offsetHeight;
      break;
    }

    case 'rightTop': {
      value1 = ele.offsetLeft;
      value2 = ele.offsetTop;
      let top_offsetWidth = 0;
      while (parent != null) {
        value1 += parent.offsetLeft;
        value2 += parent.offsetTop;
        parent = parent.offsetParent;
        parent && (top_offsetWidth = parent.offsetWidth);
      }
      value1 = top_offsetWidth - value1 - ele.offsetWidth;
      break;
    }

    case 'rightBottom': {
      value1 = ele.offsetLeft;
      value2 = ele.offsetTop;
      let top_offsetWidth = 0;
      let top_offsetHeight = 0;
      while (parent != null) {
        value1 += parent.offsetLeft;
        value2 += parent.offsetTop;
        parent = parent.offsetParent;
        if (parent) {
          top_offsetWidth = parent.offsetWidth;
          top_offsetHeight = parent.offsetHeight;
        }
      }
      value1 = top_offsetWidth - value1 - ele.offsetWidth;
      value2 = top_offsetHeight - value2 - ele.offsetHeight;
      break;
    }

    default:
      break;
  }

  targetValue.push(value1, value2);
  return targetValue;
};

export { createClassnames, isInteger, deepClone, isEqual, getClientXY };
