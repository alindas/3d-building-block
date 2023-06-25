/**
 * 根据文件名判断文件类型  根据文件名后缀返回文件类型
 * @param name 文件名
 * @returns config | model | other
 */
const getFileType = (name: string) => {
  const modelsType = ['FBX', 'GLTF'];
  const configType = 'JSON';
  const originalName = name.split('.').slice(-1)[0].toUpperCase();

  if (!originalName) {
    return 'other';
  } else if (originalName === configType) {
    return 'config';
  } else if (modelsType.some((o) => o === originalName)) {
    return 'model';
  } else {
    return 'other';
  }
};

export default getFileType;
