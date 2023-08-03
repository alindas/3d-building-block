import { useState } from 'react';
import { ChromePicker, ColorChangeHandler } from 'react-color';
import style from './index.less';

type TColor = {
  color: string;
  onChange: ColorChangeHandler;
};

let left: string, top: string;

export default function ColorPicker(props: TColor) {
  const { color, onChange } = props;
  const [colorPickerVisibility, setColorPickerVisibility] = useState(false);

  function wakeUp(e: any) {
    left = e.clientX + 'px';
    top = e.clientY + 'px';
    setColorPickerVisibility(!colorPickerVisibility);
  }

  return (
    <div className={style['color-picker']}>
      <div
        className={style['color-picker-container']}
        style={{ background: color }}
        onClick={wakeUp}
      ></div>
      {colorPickerVisibility && (
        <div
          className={style['color-picker-popover']}
          style={{ left: left, top: top }}
        >
          <div
            className={style['color-picker-cover']}
            onClick={() => setColorPickerVisibility(false)}
          />
          <ChromePicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
