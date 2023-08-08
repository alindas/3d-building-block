import { Modal } from 'antd';
import About from './about';
import Guide from './guide';

let guideModal: any;
let aboutModal: any;

const base = {
  // 内部方法，去除过渡动画
  transitionName: '',
  mask: false,
  okButtonProps: { style: { display: 'none' } },
};

export const showGuide = () => {
  if (guideModal) {
    guideModal.destroy();
    guideModal = undefined;
    return;
  }
  guideModal = Modal.info({
    ...base,
    title: '操作说明',
    content: <Guide />,
    afterClose: () => (guideModal = undefined),
  });
};

export const showAbout = () => {
  if (aboutModal) {
    aboutModal.destroy();
    aboutModal = undefined;
    return;
  }
  aboutModal = Modal.info({
    ...base,
    title: '关于',
    content: <About />,
    afterClose: () => (aboutModal = undefined),
  });
};
