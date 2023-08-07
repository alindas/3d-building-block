import React, { useEffect, useMemo, useState } from 'react';
import { connect, useSelector } from 'umi';
import { Light, Euler, MathUtils, Quaternion } from 'three';
import { Input, InputNumber, Badge, Space, Checkbox, Button } from 'antd';

import style from './light.less';
import ColorPicker from '@/components/ColorPicker';

let euler = new Euler();
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

function setAngleFromQuaternion(quaternion: Quaternion) {
  // 使用四元数更新 Euler 对象
  euler.setFromQuaternion(quaternion, 'XYZ');
  rotationX = MathUtils.radToDeg(euler.x);
  rotationY = MathUtils.radToDeg(euler.y);
  rotationZ = MathUtils.radToDeg(euler.z);
}

let _light: Light | null = null; // 当前编辑光源

function SceneLight(props: any) {
  const { dispatch } = props;
  const lightEffect = useSelector((s: any) => s.effect.lightEffect);

  const rf = useState(false)[1];

  const lights = useMemo(() => {
    const temp: Light[] = [];
    // console.log(window.scene);
    window.scene.children.forEach((o: any) => {
      if (o.isLight) {
        temp.push(o);
      }
    });
    return temp;
  }, [lightEffect]);

  useEffect(() => {
    // todo监听对象，动态刷新属性面板
    window.transformControl.addEventListener('objectChange', () => {
      if (_light !== null && window.transformControl.object.id === _light.id) {
        if (window.transformControl.mode === 'rotate') {
          setAngleFromQuaternion(_light.quaternion);
        }
        rf((f) => !f);
      }
    });
  }, []);

  function selectLight(light: Light) {
    _light = light;
    setAngleFromQuaternion(light.quaternion);

    // 设置 control
    window.transformControl.attach(light);
    rf((r) => !r);
  }

  function changeName(e: any) {
    _light!.name = e.target.value;
    rf((r) => !r);
  }

  function changeShadow(e: any) {
    _light!.name = e.target.checked;
  }

  function changeVisible(e: any) {
    _light!.visible = e.target.checked;
    const helper = window.scene.getObjectById(_light!.userData.helper);
    if (typeof helper !== 'undefined') {
      helper.visible = e.target.checked;
    }
  }

  function changeColor({ hex }: { hex: string }) {
    _light!.color.set(hex);
    rf((r) => !r);
  }

  function changeIntensity(val: number) {
    _light!.intensity = val;
    rf((r) => !r);
  }

  function changeHelper(e: any) {
    const helper = window.scene.getObjectById(_light!.userData.helper);
    if (typeof helper !== 'undefined') {
      helper.visible = e.target.checked;
    }
  }

  function deleteLight() {
    window.transformControl.detach();

    const helper = window.scene.getObjectById(_light!.userData.helper);
    if (typeof helper !== 'undefined') {
      window.scene.remove(helper);
    }
    window.scene.remove(_light!);
    _light = null;
    dispatch({ type: 'effect/updateLightEffect' });
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
              style={l.id === _light?.id ? { backgroundColor: '#f5f5f5' } : {}}
            >
              <Badge
                color={l.color.getStyle()}
                text={l.type + (l.name === '' ? '' : `—${l.name}`)}
              />
            </span>
          ))}
        </Space>
      </div>
      {_light !== null && (
        <div className={style['attr-panel']}>
          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>类型</span>
            </div>
            <div
              className={style['attr-item-value']}
              style={{ color: '#6d6d6d' }}
            >
              {_light.type}
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>名称</span>
            </div>
            <div className={style['attr-item-value']}>
              <Input
                size="small"
                value={_light.name}
                // onPressEnter={changeName}
                onChange={changeName}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>位置</span>
            </div>
            <div className={style['attr-item-value']}>
              <span className={style['attr-item-pos']}>
                <span>{_light.position.x.toFixed(2)}</span>
                <span>{_light.position.y.toFixed(2)}</span>
                <span>{_light.position.z.toFixed(2)}</span>
              </span>
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>旋转</span>
            </div>
            <div className={style['attr-item-value']}>
              <span className={style['attr-item-pos']}>
                <span>{rotationX.toFixed(2)}°</span>
                <span>{rotationY.toFixed(2)}°</span>
                <span>{rotationZ.toFixed(2)}°</span>
              </span>
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>强度</span>
            </div>
            <div className={style['attr-item-value']}>
              <InputNumber
                size="small"
                step={0.1}
                value={_light.intensity}
                onChange={changeIntensity}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>阴影</span>
            </div>
            <div className={style['attr-item-value']}>
              <Checkbox
                onChange={changeShadow}
                defaultChecked={_light.castShadow}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>颜色</span>
            </div>
            <div className={style['attr-item-value']}>
              <ColorPicker
                color={_light.color.getStyle()}
                onChange={changeColor}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>辅助</span>
            </div>
            <div className={style['attr-item-value']}>
              <Checkbox onChange={changeHelper} defaultChecked={true} />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>可见性</span>
            </div>
            <div className={style['attr-item-value']}>
              <Checkbox
                onChange={changeVisible}
                defaultChecked={_light.visible}
              />
            </div>
          </div>

          <div className={style['attr-item']} style={{ height: '3rem' }}>
            <div className={style['attr-item-title']}></div>
            <div className={style['attr-item-value']}>
              <Button type="dashed" size="small" danger onClick={deleteLight}>
                删除
              </Button>
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
