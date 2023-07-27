const DBVersion = 7;
let cache; // 存储
export const mainStore = 'recordFiles';

// class Process {
//   constructor(max = 5) {
//     this.version = 1;
//     this.cache = null;
//     this.store = 'store'
//   }

// }

/**
 * 打开数据库(数据库名，和版本号默认为1)
 * @param {string} dbName
 * @returns Promise
 */
export function openDB(dbName) {
  //返回一个 promise对象，为了实现异步传输（创建promise对象后就会立即执行）
  return new Promise((resolve, reject) => {
    //兼容浏览器
    let indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;
    let ObjectStore;

    //打开数据库，若没有就创建
    const request = indexedDB.open(dbName, DBVersion);

    //调用数据库打开或创建成功回调函数()
    request.onsuccess = (event) => {
      //获取 数据库对象,里面有很多方法（增删改查）
      cache = event.target.result;
      // console.log('数据库打开成功！');
      //返回数据库对象
      resolve(cache);
    };

    //创建或打开数据库失败回调函数
    request.onerror = (event) => {
      console.error('本地储存库打开错误');
      reject(event);
    };

    //数据库更新回调函数。初次创建，后续升级数据库用
    request.onupgradeneeded = (event) => {
      //获取数据库对象
      cache = event.target.result;
      // 清除旧 objectStore（对旧 objectStore 的数据进行迁移，暂未）
      if (cache.objectStoreNames.contains(mainStore)) {
        // console.log(db.objectStoreNames); DOMStringList 对象
        cache.deleteObjectStore(mainStore);
      }
      //创建新存储库(存储库名称，对象)-创建表（users表）
      ObjectStore = cache.createObjectStore(mainStore, {
        //主键,必须唯一
        // KeyPath: "fileID",
        keyPath: ['userId', 'channel', 'index'], // 使用自定义主键
        // autoIncrement: true   //实现自增加
      });

      //创建索引，在后面查询数据的时候可以根据索引查-创建字段（字段名，索引名，是否唯一：true）
      //可以通过索引来查询
      ObjectStore.createIndex('getFileDate', ['userId', 'channel', 'index']);
      ObjectStore.createIndex('searchByKey', ['key']);
      ObjectStore.createIndex('searchByUserId', ['userId']);
    };
  });
}

/**
 * 插入数据(数据库对象，表名，插入的数据通常为对象)
 * @param {*} db 默认为 open 值
 * @param {*} storeName
 * @param {*} data
 */
export function addData(db = cache, storeName = mainStore, data) {
  var request = db
    // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
    .transaction([storeName], 'readwrite')
    // 仓库对象
    .objectStore(storeName)
    .add(data);

  //成功回调函数
  request.onsuccess = function (event) {
    // console.log("数据写入成功");
  };

  //失败回调函数
  request.onerror = function (event) {
    console.error('数据写入失败');
  };
}

/**
 * 通过主键查询数据（数据库对象，表名，主键值）
 * @param {*} db
 * @param {*} storeName
 * @param {*} key
 * @returns
 */
export function getDataByKey(db = cache, storeName = mainStore, key) {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction([storeName]); // 事务
    var objectStore = transaction.objectStore(storeName); // 仓库对象
    var request = objectStore.get(key); // 通过主键获取的查询数据

    //失败回调函数
    request.onerror = function (event) {
      reject('事务失败');
    };

    //查询成功回调函数
    request.onsuccess = function (event) {
      resolve(request.result);
    };
  });
}

//通过游标查询所有数据（数据库对象，表名）
export function cursorGetData(db = cache, storeName = mainStore) {
  let list = [];
  var store = db
    .transaction(storeName, 'readwrite') // 事务
    .objectStore(storeName); // 仓库对象

  //初始化了一个游标对象（指针对象）
  var request = store.openCursor();

  //成功回调函数， 游标开启成功，逐行读数据
  request.onsuccess = function (e) {
    var cursor = e.target.result;
    if (cursor) {
      // 将查询值添加到列表中（游标.value=获取值）
      list.push(cursor.value);
      cursor.continue(); // 遍历了存储对象中的所有内容
    } else {
      // console.log("游标读取的数据：", list);
      //返回数据
      // resolve(list);
    }
  };
}

//通过索引查询,查询满足相等条件的第一条数据（数据库对象，表名，索引名字，索引值）
export function getDataByIndex(
  db = cache,
  storeName = mainStore,
  indexName,
  indexValue,
) {
  //通过Promise实现异步回调
  return new Promise((resolve, reject) => {
    var store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    var request = store.index(indexName).get(indexValue);
    //查询失败回调函数
    request.onerror = function () {
      console.log('查询失败');
    };
    //查询成功回调函数
    request.onsuccess = function (e) {
      var result = e.target.result;
      // console.log(typeof (result));
      //返回成功查询数据
      resolve(result);
    };
  });
}

//通过索引和游标查询多条匹配的数据（数据库对象，表名，索引名，索引值）
export function cursorGetDataByIndex(
  db = cache,
  storeName = mainStore,
  indexName,
  indexValue,
) {
  return new Promise((resolve, reject) => {
    let list = [];
    var store = db.transaction(storeName, 'readwrite').objectStore(storeName); // 仓库对象
    var request = store
      .index(indexName) // 索引对象
      .openCursor(IDBKeyRange.only(indexValue)); // 指针对象
    request.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        // 必须要检查
        list.push(cursor.value);
        cursor.continue(); // 遍历了存储对象中的所有内容
      } else {
        // console.log("游标索引查询结果：", list);
        resolve(list);
      }
    };
    request.onerror = function (e) {
      console.log('search error');
    };
  });
}

/**
 * 通过提供的主键值来更新数据，如果主键值不存在，就添加数据（数据库对象，表名，新的数据值）
 * @param {*} db
 * @param {*} storeName
 * @param {*} data
 * @returns
 */
export function updateDB(db = cache, storeName = mainStore, data) {
  return new Promise((resolve, reject) => {
    let request = db
      .transaction([storeName], 'readwrite') // 事务对象
      .objectStore(storeName) // 仓库对象
      .put(data); // 指针对象

    request.onsuccess = function () {
      resolve('数据更新成功');
    };

    request.onerror = function () {
      reject('数据更新失败');
    };
  });
}

/**
 * 通过主键删除数据（数据库对象，表名，主键值）
 * @param {*} db
 * @param {*} storeName
 * @param {*} id
 * @returns
 */
export function deleteDB(db = cache, storeName = mainStore, id) {
  return new Promise((resolve, reject) => {
    var request = db
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .delete(id);

    request.onsuccess = function () {
      // console.log("数据删除成功");
      resolve('删除成功！');
    };

    request.onerror = function () {
      // console.log("数据删除失败");
      reject('删除失败');
    };
  });
}

//通过游标和索引删除指定的多条数据（数据库对象，表名，索引名，索引值）
export function cursorDelete(
  db = cache,
  storeName = mainStore,
  indexName,
  indexValue,
) {
  return new Promise((resolve, reject) => {
    var store = db.transaction(storeName, 'readwrite').objectStore(storeName);
    var request = store
      .index(indexName) // 索引对象
      .openCursor(IDBKeyRange.only(indexValue)); // 指针对象

    request.onsuccess = function (e) {
      var cursor = e.target.result;
      var deleteRequest;
      if (cursor) {
        deleteRequest = cursor.delete(); // 请求删除当前项
        deleteRequest.onerror = function () {
          // console.log("游标删除该记录失败");
          reject('删除失败！');
        };
        deleteRequest.onsuccess = function () {
          // console.log("游标删除该记录成功");
          resolve('删除成功！');
        };
        cursor.continue();
      }
    };
    request.onerror = function (e) {};
  });
}

//关闭数据库
export function closeDB(db = cache) {
  return new Promise((resolve, reject) => {
    db.close();
    resolve('数据库已关闭');
  });
}
