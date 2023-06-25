function isUndefinedOrNull(obj) {
  return typeof obj == 'undefined' || obj === null;
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

export {
  isUndefinedOrNull,
  createClassnames,
  isInteger,
  deepClone,
  isEqual,
  getClientXY,
};
