import React, { useMemo, useState } from 'react';
import { connect } from 'umi';
import { Light, Euler, MathUtils, Quaternion } from 'three';
import { Input, Badge, Space, Checkbox } from 'antd';

import style from './light.less';
import ColorPicker from '@/components/ColorPicker';

const colors = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
];
let euler = new Euler();
let rotationX: number, rotationY: number, rotationZ: number;

function setAngleFromQuaternion(quaternion: Quaternion) {
  // 使用四元数更新 Euler 对象
  euler.setFromQuaternion(quaternion, 'XYZ');
  rotationX = MathUtils.radToDeg(euler.x);
  rotationY = MathUtils.radToDeg(euler.y);
  rotationZ = MathUtils.radToDeg(euler.z);
}

function SceneLight(props: any) {
  const { dispatch } = props;

  const [light, setLight] = useState<Light>();
  const lights = useMemo(() => {
    const temp: Light[] = [];
    console.log(window.scene);
    window.scene.children.forEach((o: any) => {
      if (o.isLight) {
        temp.push(o);
      }
    });
    return temp;
  }, []);

  function selectLight(light: Light) {
    setLight(light);
    setAngleFromQuaternion(light.quaternion);
    // todo监听对象，动态刷新属性面板
  }

  function changeName(e) {
    console.log(e);
  }

  function changeVisible(e) {
    console.log(e);
  }

  function changeColor(e) {
    console.log(e);
  }

  return (
    <div>
      <div className={style['out-linear']}>
        <Space direction="vertical" size={4}>
          {lights.map((l) => (
            <span
              key={l.id}
              className={style['ant-badge-wp']}
              onClick={() => selectLight(l)}
              style={l.id === light?.id ? { backgroundColor: '#f5f5f5' } : {}}
            >
              <Badge
                color={l.color.getStyle()}
                text={l.type + (l.name === '' ? '' : `——${l.name}`)}
              />
            </span>
          ))}
        </Space>
      </div>
      {typeof light !== 'undefined' && (
        <div className={style['attr-panel']}>
          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>类型</span>
            </div>
            <div className={style['attr-item-input']}>{light.type}</div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>名称</span>
            </div>
            <div className={style['attr-item-input']}>
              <Input
                size="small"
                defaultValue={light.name}
                onPressEnter={changeName}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>位置</span>
            </div>
            <div className={style['attr-item-value']}>
              <span className={style['attr-item-pos']}>
                <span>{light.position.x}</span>
                <span>{light.position.y}</span>
                <span>{light.position.z}</span>
              </span>
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>旋转</span>
            </div>
            <div className={style['attr-item-value']}>
              <span className={style['attr-item-pos']}>
                <span>{rotationX}°</span>
                <span>{rotationY}°</span>
                <span>{rotationZ}°</span>
              </span>
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>缩放</span>
            </div>
            <div className={style['attr-item-value']}>
              <span className={style['attr-item-pos']}>
                <span>{light.scale.x}</span>
                <span>{light.scale.y}</span>
                <span>{light.scale.z}</span>
              </span>
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>可见性</span>
            </div>
            <div className={style['attr-item-input']}>
              <Checkbox
                onChange={changeVisible}
                defaultChecked={light.visible}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>颜色</span>
            </div>
            <div className={style['attr-item-input']}>
              <ColorPicker
                color={light.color.getStyle()}
                onChange={changeColor}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>辅助</span>
            </div>
            <div className={style['attr-item-input']}>
              <Checkbox
                onChange={changeVisible}
                defaultChecked={light.visible}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default connect((state: any) => ({
  menuProject: state.project,
}))(SceneLight);
