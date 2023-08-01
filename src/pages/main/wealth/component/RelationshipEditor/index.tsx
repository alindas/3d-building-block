import { connect, SceneState } from 'umi';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Tree, Button, Modal, Input } from 'antd';
import type { DataNode, TreeProps } from 'antd/lib/tree';
import {
  EditOutlined,
  CloseCircleOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import { Vector3 } from 'three';
import style from './index.less';
import { isUndefinedOrNull } from '@/utils/common';
import { TransformArrayToHash, updateModelFromName } from '@/utils/threeD';

import RightMenu from '@/components/RightMenu';
import { ConnectProps } from '@/common/type';
import { updateSelectedModel } from '@/models/proxy';

const generateData = (originalData: any, prevKey?: string): any[] => {
  const result: any[] = [];
  if (!isUndefinedOrNull(originalData)) {
    /**
     * 将 model 数据转换成 [{title: 'anything', key: '0-0', id: number, position: number, children: []}] 的格式
     */
    originalData.forEach((child: any, index: number) => {
      if (isUndefinedOrNull(child) || (child.parent.isMesh && child.isGroup)) {
        return;
      }
      let key = `${prevKey ?? '0'}-${index}`;
      if (child.children.length != 0) {
        result.push({
          title: child.name,
          key,
          id: child.id,
          position: index,
          children: generateData(child.children, key),
        });
      } else {
        result.push({
          title: child.name,
          key,
          id: child.id,
          position: index,
        });
      }
    });
  }
  return result;
};

// 遍历 modelList 找到要删除的节点
function loopSetDelete(array: any[], lineArray: string | any[], index: number) {
  // 如果节点长度为二，则直接从 array 中删除
  // 如果目标已经遍历到末尾倒数第二位，则从其父节点的 children 中删除
  if (index == lineArray.length - 1) {
    const tailArray: any[] = [];
    const targetPos = parseInt(lineArray[index]);
    const prefixKey = array[0].key.slice(0, -1);
    array.forEach(
      (
        item: { position: number; title: any; id: any; children: any },
        index: number,
      ) => {
        if (item.position < targetPos) {
          return tailArray.push(item);
        } else if (item.position > targetPos) {
          tailArray.push({
            title: item.title,
            key: `${prefixKey}${index - 1}`,
            id: item.id,
            position: index - 1,
            children: item.children ?? [],
          });
        }
      },
    );
    array.splice(0, array.length, ...tailArray);
  } else {
    // console.log(parseInt(lineArray[index]));
    // console.log(array[parseInt(lineArray[index])]);
    let i = index + 1;
    // index++;
    loopSetDelete(array[parseInt(lineArray[index])].children, lineArray, i);
  }
}

function RelationshipEditor(
  props: ConnectProps<{
    sceneModel: SceneState;
    canAddModel: boolean;
  }>,
) {
  const { dispatch, canAddModel } = props;
  const {
    workbenchModel,
    workbenchModelHash,
    selectedModel,
    forceUpdateModel,
  } = props.sceneModel;

  const treeContainerRef = useRef<HTMLDivElement | null>(null);
  const [modelList, setModelList] = useState<any[]>([]);
  const [treeHeight, setTreeHeight] = useState<number>(0);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);
  const [rightMenuConfig, setRightMenuConfig] = useState<{
    visibility: boolean;
    position: [number, number];
  }>({ visibility: false, position: [0, 0] });
  const [ifMultiple, setIfMultiple] = useState(false);

  const rightMenuVisibility = useRef(false);
  const rightMenuSelectModelName = useRef({
    key: '',
    initial: '',
    edited: '',
    id: -1,
  });

  useEffect(() => {
    function clearRightMenu() {
      if (rightMenuVisibility.current) {
        setRightMenuConfig({
          visibility: false,
          position: [0, 0],
        });
        rightMenuVisibility.current = false;
      }
    }

    window.addEventListener('click', clearRightMenu);

    return () => {
      window.removeEventListener('click', clearRightMenu);
    };
  }, []);

  // 构建工作台模型关系树
  useEffect(() => {
    // console.log(workbenchModel?.children);
    // console.log(generateData(workbenchModel?.children));

    setModelList(generateData(workbenchModel?.children));
  }, [forceUpdateModel]);

  useLayoutEffect(() => {
    let height = treeContainerRef.current!.clientHeight;
    setTreeHeight(height);
  }, []);

  useEffect(() => {
    if (isUndefinedOrNull(selectedModel)) {
      setSelectedKey([]);
    }
  }, [selectedModel]);

  const loopSetModel = (obj: any, dragNode: any, parent?: string) => {
    let originalData = workbenchModelHash[obj.id];

    /**
     * 模型父子关系变化后，世界坐标和本地坐标的转换
     * 思路：通过 getWorldPosition api 求得变化前后的新的父子关系的模型的世界坐标 s1 s2，
     * 相减得到的世界坐标差 s 便是子模型的本地坐标
     */
    if (dragNode.id === obj.id) {
      let selfPos = new Vector3();
      originalData.getWorldPosition(selfPos);

      if (typeof parent !== 'undefined') {
        let parentPos = new Vector3();
        workbenchModelHash[parent!].getWorldPosition(parentPos);

        // console.log('parentPos2', parentPos);
        // console.log('selfPos', selfPos);

        selfPos.add(parentPos.negate());
        // ✳ 这里需要将 y 和 z 数据交互是因为目前模型子模型 z 轴朝上，threeJs 系统轴 y 朝上
        // 场景下的模型跟随系统轴
        // @ts-ignore
        if (workbenchModelHash[parent!]!.parent?.isGroup) {
          originalData.position.set(
            selfPos.x,
            selfPos.y < 0
              ? selfPos.z < 0
                ? -selfPos.z
                : selfPos.z
              : selfPos.z > 0
              ? -selfPos.z
              : selfPos.z,
            selfPos.z < 0
              ? selfPos.y < 0
                ? selfPos.y
                : -selfPos.y
              : selfPos.y > 0
              ? selfPos.y
              : -selfPos.y,
          );
          originalData.rotateX(Math.PI / 2);
        } else {
          originalData.position.set(
            selfPos.x,
            selfPos.y < 0
              ? selfPos.z < 0
                ? selfPos.z
                : -selfPos.z
              : selfPos.z > 0
              ? selfPos.z
              : -selfPos.z,
            selfPos.z < 0
              ? selfPos.y < 0
                ? selfPos.y
                : -selfPos.y
              : selfPos.y > 0
              ? selfPos.y
              : -selfPos.y,
          );
        }

        originalData.removeFromParent();
        workbenchModelHash[parent!].add(originalData);
      } else {
        // 放置在 group 下一层
        originalData.position.copy(selfPos);
        originalData.removeFromParent();
        originalData.rotateX(-Math.PI / 2);
      }
    }
    if (obj.children) {
      obj.children.forEach((item: any) => {
        // originalData.remove(workbenchModelHash[item.id]);
        // originalData.add(loopSetModel(item, dragNode, obj.id));
        loopSetModel(item, dragNode, obj.id);
      });

      // Mesh 对象不能直接赋值
      // originalData.children = obj.children.map((item: any) => loopSetModel(item));
    }
    return originalData;
  };

  /**
   * 基于 workbenchModelHash 进行数据组合，排列好后直接更新 Model，无须更新关系列表
   *
   */
  const onDrop: TreeProps['onDrop'] = (info) => {
    // console.log('info', info);

    /**
     * node         代表当前被 drop 的对象
     * dragNode     代表当前需要 drop 的对象
     * dropPosition 代表 drop 后的节点位置；不准确
     * dropToGap    代表移动到非最顶级组第一个位置
     */
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;

    const dropPos = info.node.pos.split('-');

    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    // 功能类似 three 中的 traverse，遍历目标对象及其子对象直到找到目标 drag 数据为止
    const loop = (
      data: DataNode[],
      key: React.Key,
      callback: (node: DataNode, i: number, data: DataNode[]) => void,
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };
    const data = [...modelList];
    // console.log(data);

    // 获取拖动的节点，从原数组中删除并保存到 dragObj 中
    let dragObj: DataNode;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // 移动到非最顶级组第一个位置
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      // 平级移动、交叉组移动、移动到其他组(非最顶级)非第一个位置
      let ar: DataNode[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      // 拖到最外的顶层
      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj!);
      } else {
        // 只要不是处于第一，便来到这里
        ar.splice(i! + 1, 0, dragObj!);
      }
    }

    let prevTreeNode = parseInt((dropKey as string).split('-')[1]);
    let nextTreeNode = parseInt((dragKey as string).split('-')[1]);
    let modelHash: any[] = [];

    const targetModels = data.filter(
      (item) => item.position == prevTreeNode || item.positon == nextTreeNode,
    );
    // console.log('gar', targetModels);

    let model = targetModels.map((item) => {
      let temp = loopSetModel(item, dragObj);
      modelHash.push(temp);
      return temp;
    });

    // let model = data.map((item) => {
    //   if (item.position == prevTreeNode || item.positon == nextTreeNode) {
    //     console.log(item);

    //     let temp = loopSetModel(item, dragObj);
    //     modelHash.push(temp);
    //     return temp;
    //   } else {
    //     // 不是变化的节点则直接赋予旧值
    //     let originalData = workbenchModelHash[item.id];

    //     let temp = new Vector3();
    //     originalData.getWorldPosition(temp);

    //     // 导入模型时存在位置变换，执行相应补偿
    //     if (transformStatus.rotation) {
    //       originalData.position.copy(temp.multiply(transformStatus.rotation));
    //     }
    //     // 最外层模型的位置默认为世界坐标
    //     originalData.position.copy(temp);
    //     // console.log('temp', temp);

    //     return originalData;
    //   }
    // });

    // console.log('modelHash in Relationship', modelHash);
    // console.log('model in Relationship', model);

    // 调整 redux 上的模型
    dispatch({
      type: 'scene/updateWorkbenchModel',
      payload: {
        model,
        modelHash,
      },
    });

    setModelList(data);
  };

  // 左侧栏选择模型
  const onSelect = (key: any, info: any) => {
    // 如果当前节点已被选中，则取消选择
    if (key.length == 0 || selectedKey[0] === key[0]) {
      return;
    }

    updateSelectedModel(workbenchModelHash[info.node.id]);
    // dispatch({
    //   type: 'scene/updateSelectedModel',
    //   payload: workbenchModelHash[info.node.id],
    // });

    // 添加受控节点
    setSelectedKey(key);
  };

  const onRightClick = ({ event, node }: { event: any; node: any }) => {
    console.log('node in Relation', node);
    rightMenuSelectModelName.current = {
      key: node.key,
      initial: node.title,
      edited: node.title,
      id: node.id,
    };
    event.preventDefault();
    event.stopPropagation();
    setRightMenuConfig({
      visibility: true,
      position: [event.clientX, event.clientY],
    });
    rightMenuVisibility.current = true;
  };

  const renameModel = () => {
    setRightMenuConfig({
      visibility: false,
      position: [0, 0],
    });

    Modal.confirm({
      title: '重命名',
      content: (
        <Input
          placeholder="请输入名称"
          defaultValue={rightMenuSelectModelName.current.initial}
          onChange={handleModelNameChange}
        />
      ),
      icon: null,
      centered: true,
      closable: true,
      okText: '确定',
      onOk: confirmModelName,
      cancelText: '取消',
    });
  };

  const handleModelNameChange = (ev: any) => {
    // if (/\W/.test(ev.target.value)) return;
    // let QT = ev.target.value.replace(/\W/g, '');
    // 机器人或cnc中的命名，有中划线的
    let QT = ev.target.value.replace(/^A-Za-z0-9_-/g, '');
    rightMenuSelectModelName.current.edited = QT;
  };

  const confirmModelName = () => {
    // console.log('newModelName: ', rightMenuSelectModelName.current);
    // console.log('modelList', modelList);

    /**
     * 先将当前编辑的节点 key 按层级切分，得到整条线上的所有关联节点
     * 通过 modelList 找出所有关联节点的名称，遍历过程中修改 workbenchModelHash 的对应模型
     * 将修改后的 workbenchModelHash 和 workbenchModel 更新到 model 上
     * 同时修改 modelList 以更新关系树
     */
    //
    let modelLevel = rightMenuSelectModelName.current.key.split('-');
    let [newModelList, modelIdList] = updateModelFromName(
      modelList,
      modelLevel,
      rightMenuSelectModelName.current.edited,
    ); // 储存通过 key 找出来的 id

    // 调整 redux 上的模型
    dispatch({
      type: 'scene/modifyModel',
      payload: {
        modifyList: modelIdList,
        attribute: {
          name: rightMenuSelectModelName.current.edited,
        },
      },
    });

    setModelList([...newModelList]);
  };

  const deleteModel = () => {
    setRightMenuConfig({
      visibility: false,
      position: [0, 0],
    });
    // console.log('currentOp', rightMenuSelectModelName.current);
    dispatch({
      type: 'scene/updateWorkbenchModel',
      payload: {
        type: 'delete',
        id: rightMenuSelectModelName.current.id,
      },
    });
    // console.log(modelList);
    const line = rightMenuSelectModelName.current.key.split('-');
    loopSetDelete(modelList, line, 1);

    setModelList([...modelList]);
  };

  //添加单个模型到scene下
  function addModelToWorkbench(e: any) {
    if (!window.loader.loading) {
      window.loader.loadModel(e.target.files, (model) => {
        dispatch({
          type: 'scene/updateWorkbenchModel',
          payload: {
            model,
            type: 'add',
            modelHash: TransformArrayToHash(model),
          },
        });
      });
    }

    e.target.value = '';
  }

  function handleMultipleChoice() {
    setIfMultiple(!ifMultiple);
    setRightMenuConfig({
      visibility: false,
      position: [0, 0],
    });
  }

  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };

  return (
    <div
      className={style['relationship-editor']}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={style['import-btn']}>
        <Button
          type="primary"
          disabled={!canAddModel}
          onClick={() => {
            document.getElementById('addModel')!.click();
          }}
        >
          <input
            type="file"
            style={{ display: 'none' }}
            id="addModel"
            onChange={addModelToWorkbench}
          ></input>
          导入模型
        </Button>
      </div>
      <div className={style['tree-container']} ref={treeContainerRef}>
        {treeHeight !== 0 && modelList.length !== 0 && (
          <Tree
            checkable={ifMultiple}
            checkStrictly
            height={treeHeight}
            className="draggable-tree"
            draggable
            blockNode
            defaultExpandedKeys={['0-0']}
            selectedKeys={selectedKey}
            treeData={modelList}
            onDrop={onDrop}
            onSelect={onSelect}
            onCheck={onCheck}
            onRightClick={onRightClick}
          />
        )}
      </div>
      <RightMenu
        visiblity={rightMenuConfig.visibility}
        position={rightMenuConfig.position}
        menuItems={[
          {
            key: 'multiple',
            label: ifMultiple ? '取消多选' : '多选',
            onClick: handleMultipleChoice,
            icon: <AppstoreAddOutlined />,
          },
          {
            key: 'rename',
            label: '重命名',
            onClick: renameModel,
            icon: <EditOutlined />,
          },
          {
            key: 'delete',
            label: '删除',
            onClick: deleteModel,
            icon: <CloseCircleOutlined />,
          },
        ]}
      />
    </div>
  );
}

export default connect((state: any) => ({
  sceneModel: state.scene,
  canAddModel: state.project.projectInfo !== null,
}))(RelationshipEditor);
