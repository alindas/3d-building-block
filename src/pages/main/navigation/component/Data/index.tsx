import { Modal } from 'antd';
import { baseModalConfig } from '../Helper';
import Active from './active';
import Service from './service';
import style from './index.less';

let ScriptModal: any;
let ServiceModal: any;

const dataModalConfig = {
  wrapClassName: style['data-modal-config'],
  icon: null,
  width: '50vw',
};

export const showScript = () => {
  if (ScriptModal) {
    ScriptModal.destroy();
    ScriptModal = undefined;
    return;
  }
  ScriptModal = Modal.info({
    ...baseModalConfig,
    ...dataModalConfig,
    content: <Active />,
    afterClose: () => (ScriptModal = undefined),
  });
};

export const showService = () => {
  if (ServiceModal) {
    ServiceModal.destroy();
    ServiceModal = undefined;
    return;
  }
  ServiceModal = Modal.info({
    ...baseModalConfig,
    ...dataModalConfig,
    content: <Service />,
    afterClose: () => (ServiceModal = undefined),
  });
};
