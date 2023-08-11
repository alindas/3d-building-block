import { useRef, useEffect, memo } from 'react';
import {
  Content,
  JSONContent,
  JSONEditor,
  JSONValue,
} from '@/utils/correct-package/svelet-jsoneditor';
import styles from './index.less';
import './origin.css';

type TJSONEditor = {
  content: Content;
  readOnly: boolean;
  onError?: (e: any) => void;
  onChange?: (ctn: any, prev: any, status: any) => void;
};

let editor: JSONEditor | null = null;

function MyJSONEditor(props: TJSONEditor) {
  const refContainer = useRef(null);

  // 初始化
  useEffect(() => {
    editor = new JSONEditor({
      target: refContainer.current!,
      props: {
        content: props.content,
        // @ts-ignore
        mode: 'text',
        mainMenuBar: false, // 不展示默认菜单栏
        navigationBar: false,
        statusBar: false,
        readOnly: true,
        onError: props.onError,
        onChange: props.onChange,
      },
    });

    return () => {
      // destroy editor
      if (editor) {
        editor.destroy();
        editor = null;
      }
    };
  }, []);

  // 配置更新, 内容变化, 编辑模型下不受影响
  useEffect(() => {
    console.log('here');
    if (editor !== null) {
      // if (props.readOnly) {
      //   editor.update(props.content);

      // }
      editor.updateProps({ content: props.content, readOnly: props.readOnly });
    }
  }, [props.readOnly, props.content]);

  return (
    <div className={styles.json_container}>
      <div className={styles.json_editor} ref={refContainer}></div>
    </div>
  );
}

export default MyJSONEditor;
// export default memo(MyJSONEditor, (prev, next) => {
//   return false
//   if (prev.readOnly === true && next.readOnly === true) {
//     if (prev.content !== next.content) {
//       return false
//     } else {
//       return true
//     }
//   } else {
//     return false
//   }
// })
