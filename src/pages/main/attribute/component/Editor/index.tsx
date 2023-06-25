import { connect } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import { InputNumber, Checkbox, Select, Slider } from 'antd';
import { ChromePicker } from 'react-color';
import {
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  FrontSide,
  BackSide,
  DoubleSide,
  Color,
} from 'three';

import style from './index.less';
import attrRefresh from '@/assets/attrRefresh.png';
import { isInteger, isUndefinedOrNull } from '@/utils/common';
import { checkMaterialModifyTime } from '@/utils/threeD';

const { Option } = Select;

const XYZ = { x: '', y: '', z: '' };
const MATERIAL = {
  type: 'Basic',
  color: 'rgb(0, 0, 0)',
};

type TInput = {
  type: 'position' | 'scale';
  key: 'x' | 'y' | 'z';
  value: number;
};

function getSide(id: 0 | 1 | 2) {
  if (id === 0) {
    return FrontSide;
  } else if (id === 1) {
    return BackSide;
  } else if (id === 2) {
    return DoubleSide;
  } else {
    return DoubleSide;
  }
}

function Editor(props: any) {
  // console.log('Editer', props.selectedModel);
  const { position = XYZ, scale = XYZ, material } = props.selectedModel ?? {};
  const disableEdit = props.selectedModel === null ? true : false;

  const [colorPickerVisibility, setColorPickerVisibility] = useState(false);
  const [materialCfg, setMaterialCfg] = useState<{
    side: number;
    current: any;
  }>({
    side: -1,
    current: MATERIAL,
  });
  const [materialColor, setMaterialColor] = useState(MATERIAL.color);
  const inputValue = useRef<any>({ equalRadio: true });

  useEffect(() => {
    if (!isUndefinedOrNull(material)) {
      // 如果是多面材质，则需要修改该面序列
      if (Array.isArray(material)) {
        setMaterialCfg({
          side: 0,
          current: material[0],
        });
        setMaterialColor(material[0].color.getStyle());
      } else {
        setMaterialCfg({
          side: -1,
          current: material,
        });
        setMaterialColor(material.color.getStyle());
      }
    }
  }, [material]);

  function handleMaterialSideChange(_: any, { key }: any) {
    setMaterialCfg({
      side: key,
      current: material[key],
    });
    setMaterialColor(material[key].color.getStyle());
  }

  // 材质类型变更
  function handleMaterialTypeChange(val: any) {
    switch (val) {
      case 'MeshBasicMaterial': {
        materialCfg.current = new MeshBasicMaterial({
          color: materialColor,
          side: getSide(materialCfg.current.side),
        });
        break;
      }
      case 'MeshLambertMaterial': {
        materialCfg.current = new MeshLambertMaterial({
          color: materialColor,
          side: getSide(materialCfg.current.side),
        });
        break;
      }
      case 'MeshPhongMaterial': {
        materialCfg.current = new MeshPhongMaterial({
          color: materialColor,
          side: getSide(materialCfg.current.side),
        });
        break;
      }
      case 'MeshStandardMaterial': {
        materialCfg.current = new MeshStandardMaterial({
          name: 'standar',
          color: materialColor,
          side: getSide(materialCfg.current.side),
          // roughness: materialCfg.current.roughness
        });
        break;
      }
      default:
        break;
    }

    updateModelMaterial();
  }

  // 材质颜色变更
  function handleMaterialColorChange({ hex }: any) {
    setMaterialColor(hex);
    const deterioration = checkMaterialModifyTime(
      materialCfg.side == -1 ? material : material[materialCfg.side],
    );
    let payload: any;
    if (typeof deterioration === 'boolean') {
      payload = {
        attribute: {
          color: new Color(hex),
        },
      };
    } else {
      deterioration.color = new Color(hex);
      payload = {
        material: deterioration,
      };
    }

    if (materialCfg.side !== -1) {
      payload.side = materialCfg.side;
      props.dispatch({
        type: 'scene/modifySelectedModelMaterialMultiple',
        payload,
      });
    } else {
      props.dispatch({
        type: 'scene/modifySelectedModelMaterialSingle',
        payload,
      });
    }
  }

  function handleMaterialChange(val: number, type: string) {
    const deterioration = checkMaterialModifyTime(
      materialCfg.side == -1 ? material : material[materialCfg.side],
    );
    let payload: any;
    if (typeof deterioration === 'boolean') {
      payload = {
        attribute: {
          [type]: val,
        },
      };
    } else {
      deterioration[type] = val;
      payload = {
        material: deterioration,
      };
    }

    if (materialCfg.side !== -1) {
      payload.side = materialCfg.side;
      props.dispatch({
        type: 'scene/modifySelectedModelMaterialMultiple',
        payload,
      });
    } else {
      props.dispatch({
        type: 'scene/modifySelectedModelMaterialSingle',
        payload,
      });
    }
  }

  function handleInputValueChange(option: TInput) {
    // console.log(option);
    const { type, key } = option;
    const value = parseFloat(option.value.toFixed(2));

    if (isUndefinedOrNull(inputValue.current[type])) {
      inputValue.current[type] = {};
    }

    if (!isUndefinedOrNull(value)) {
      if (type === 'scale' && inputValue.current.equalRadio) {
        // 当前编辑的是缩放并且开启等比

        if (value === 0) {
          return;
        }

        let ratio = value / scale[key];
        inputValue.current.scale.x = scale.x * ratio;
        inputValue.current.scale.y = scale.y * ratio;
        inputValue.current.scale.z = scale.z * ratio;
      } else {
        inputValue.current[type][key] = value;
      }
    } else if (!isUndefinedOrNull(inputValue.current[type][key])) {
      delete inputValue.current[type][key];
    }

    updateModel();
  }

  // 将所有产生修改的 input 输入框的数据更新到 model 上
  function updateModel() {
    const modifyObj: any = {};

    for (let attr in inputValue.current) {
      modifyObj[attr] = {
        ...props.selectedModel[attr],
        ...inputValue.current[attr],
      };
    }

    props.dispatch({
      type: 'scene/modifySelectedModel',
      payload: modifyObj,
    });

    inputValue.current = {
      equalRadio: inputValue.current.equalRadio,
    };
  }

  // 将新的模型材质更新到 model 上
  function updateModelMaterial() {
    props.dispatch({
      type: 'scene/modifySelectedModel',
      payload: {
        material: materialCfg.side == -1 ? materialCfg.current : materialCfg,
      },
    });
  }

  return (
    <div className={style['editor-wrapper']}>
      <div className={style['position']}>
        <div className={style['item-title']}>
          <span>坐标</span>
          <img src={attrRefresh} />
        </div>
        <div className={style['item-body']}>
          <div className="flex-center">
            X
            <InputNumber
              value={position.x}
              disabled={disableEdit}
              precision={2}
              controls={false}
              // onPressEnter={updateModel}
              onChange={(val) =>
                handleInputValueChange({
                  type: 'position',
                  key: 'x',
                  value: val,
                })
              }
            />
          </div>
          <div className="flex-center">
            Y
            <InputNumber
              value={position.y}
              disabled={disableEdit}
              precision={2}
              controls={false}
              // onPressEnter={updateModel}
              onChange={(val) =>
                handleInputValueChange({
                  type: 'position',
                  key: 'y',
                  value: val,
                })
              }
            />
          </div>
          <div className="flex-center">
            Z
            <InputNumber
              value={position.z}
              disabled={disableEdit}
              precision={2}
              controls={false}
              // onPressEnter={updateModel}
              onChange={(val) =>
                handleInputValueChange({
                  type: 'position',
                  key: 'z',
                  value: val,
                })
              }
            />
          </div>
        </div>
      </div>
      <div className={style['scale']}>
        <div className={style['item-title']}>
          <span>缩放</span>
          <img src={attrRefresh} />
        </div>
        <div className={style['item-body']}>
          <Checkbox
            disabled={disableEdit}
            defaultChecked
            onChange={(e) => {
              inputValue.current.equalRadio = e.target.checked;
            }}
          >
            等比缩放
          </Checkbox>
          <div>
            <div className="flex-center">
              X
              <InputNumber
                value={scale.x}
                disabled={disableEdit}
                controls={false}
                // precision={isInteger(scale.x) ? 0 : 2}
                precision={2}
                // onPressEnter={updateModel}
                onChange={(val) =>
                  handleInputValueChange({
                    type: 'scale',
                    key: 'x',
                    value: val,
                  })
                }
              />
            </div>
            <div className="flex-center">
              Y
              <InputNumber
                value={scale.y}
                disabled={disableEdit}
                controls={false}
                // precision={isInteger(scale.y) ? 0 : 2}
                precision={2}
                // onPressEnter={updateModel}
                onChange={(val) =>
                  handleInputValueChange({
                    type: 'scale',
                    key: 'y',
                    value: val,
                  })
                }
              />
            </div>
            <div className="flex-center">
              Z
              <InputNumber
                value={scale.z}
                disabled={disableEdit}
                controls={false}
                // precision={isInteger(scale.z) ? 0 : 2}
                precision={2}
                // onPressEnter={updateModel}
                onChange={(val) =>
                  handleInputValueChange({
                    type: 'scale',
                    key: 'z',
                    value: val,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className={style['material']}>
        <div className={style['item-title']}>
          <span>材质</span>
        </div>
        <div className={style['item-body']}>
          {Array.isArray(material) && materialCfg.side !== -1 && (
            <div>
              &emsp;面
              <Select
                value={material[materialCfg.side].id}
                size="small"
                onChange={handleMaterialSideChange}
              >
                {material.map((item: any, index: number) => (
                  <Option key={index} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}
          <div>
            类型
            <Select
              value={materialCfg.current.type}
              size="small"
              onChange={handleMaterialTypeChange}
            >
              <Option value="MeshBasicMaterial">基础网格</Option>
              <Option value="MeshLambertMaterial">Lambert网格</Option>
              <Option value="MeshPhongMaterial">高光Phong</Option>
              <Option value="MeshStandardMaterial">PBR物理</Option>
            </Select>
          </div>
          <div className={style['color-picker-wrapper']}>
            颜色
            <div
              className={style['color-picker-container']}
              style={{ background: materialColor }}
              onClick={() => setColorPickerVisibility(!colorPickerVisibility)}
            ></div>
            {colorPickerVisibility && (
              <div className={style['color-picker-popover']}>
                <div
                  className={style['color-picker-cover']}
                  onClick={() => setColorPickerVisibility(false)}
                />
                <ChromePicker
                  color={materialColor}
                  onChange={handleMaterialColorChange}
                />
              </div>
            )}
          </div>
          {materialCfg.current.type === 'MeshStandardMaterial' && (
            <>
              <div className={style['item-slider']}>
                金属感&emsp;
                <Slider
                  value={materialCfg.current.metalness}
                  onChange={(val) => handleMaterialChange(val, 'metalness')}
                  min={0}
                  max={1}
                  step={0.1}
                />
                {materialCfg.current.metalness}
              </div>
              <div className={style['item-slider']}>
                粗糙度&emsp;
                <Slider
                  value={materialCfg.current.roughness}
                  onChange={(val) => handleMaterialChange(val, 'roughness')}
                  min={0}
                  max={1}
                  step={0.1}
                />
                {materialCfg.current.roughness}
              </div>
            </>
          )}
        </div>
        <div
          className={style['item-body-mask']}
          style={props.selectedModel?.isMesh ? {} : { bottom: 0 }}
        ></div>
      </div>
    </div>
  );
}

export default connect(({ scene }: any) => ({
  selectedModel: scene.selectedModel,
  sceneRefreshTrigger: scene.sceneRefreshTrigger,
}))(Editor);
