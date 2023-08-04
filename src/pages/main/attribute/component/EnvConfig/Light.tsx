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

function SceneLight(props: any) {
  const { dispatch } = props;
  const lightEffect = useSelector((s: any) => s.effect.lightEffect);

  const [light, setLight] = useState<Light>();
  const rf = useState(false)[1];
  const lights = useMemo(() => {
    const temp: Light[] = [];
    console.log(window.scene);
    window.scene.children.forEach((o: any) => {
      if (o.isLight) {
        temp.push(o);
      }
    });
    return temp;
  }, [lightEffect]);

  useEffect(() => {}, []);

  function selectLight(light: Light) {
    setLight(light);
    setAngleFromQuaternion(light.quaternion);
    // todo监听对象，动态刷新属性面板
    // window.transformControl.addEventListener('change', () => {

    // });
    // 设置 control
    window.transformControl.detach();
    window.transformControl.attach(light);
  }

  function changeName(e: any) {
    console.log(e);
    light!.name = e.target.value;
    rf((r) => !r);
  }

  function changeShadow(e: any) {
    console.log(e);
    light!.name = e.target.checked;
  }

  function changeVisible(e: any) {
    console.log(e);
    light!.visible = e.target.checked;
    const helper = window.scene.getObjectById(light!.userData.helper);
    if (typeof helper !== 'undefined') {
      helper.visible = e.target.checked;
    }
  }

  function changeColor({ hex }: { hex: string }) {
    light!.color.set(hex);
    rf((r) => !r);
  }

  function changeIntensity(val: number) {
    console.log(val);
    light!.intensity = val;
    rf((r) => !r);
  }

  function changeHelper(e: any) {
    const helper = window.scene.getObjectById(light!.userData.helper);
    if (typeof helper !== 'undefined') {
      helper.visible = e.target.checked;
    }
  }

  function deleteLight() {
    window.transformControl.detach();

    const helper = window.scene.getObjectById(light!.userData.helper);
    if (typeof helper !== 'undefined') {
      window.scene.remove(helper);
    }
    window.scene.remove(light!);

    setLight(undefined);
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
              style={l.id === light?.id ? { backgroundColor: '#f5f5f5' } : {}}
            >
              <Badge
                color={l.color.getStyle()}
                text={l.type + (l.name === '' ? '' : `—${l.name}`)}
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
            <div
              className={style['attr-item-value']}
              style={{ color: '#6d6d6d' }}
            >
              {light.type}
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>名称</span>
            </div>
            <div className={style['attr-item-value']}>
              <Input
                size="small"
                value={light.name}
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
                <span>{light.position.x.toFixed(2)}</span>
                <span>{light.position.y.toFixed(2)}</span>
                <span>{light.position.z.toFixed(2)}</span>
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
                value={light.intensity}
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
                defaultChecked={light.castShadow}
              />
            </div>
          </div>

          <div className={style['attr-item']}>
            <div className={style['attr-item-title']}>
              <span>颜色</span>
            </div>
            <div className={style['attr-item-value']}>
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
                defaultChecked={light.visible}
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
