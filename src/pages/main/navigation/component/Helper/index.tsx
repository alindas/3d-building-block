import Question from '@/components/Question';
import { Modal } from 'antd';
import About from './about';
import Guide from './guide';

let guideModal: any;
let aboutModal: any;

export const baseModalConfig = {
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
    ...baseModalConfig,
    title: (
      <>
        操作说明
        <Question link="/doc/guide.pdf" />
      </>
    ),
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
    ...baseModalConfig,
    title: '关于',
    content: <About />,
    afterClose: () => (aboutModal = undefined),
  });
};
