import React from 'react';
import { Empty } from 'antd';

import style from './index.less';

type TEmpty = {
  desc?: string;
};

const EmptyData: React.FC<TEmpty> = (props) => {
  const { desc = '' } = props;

  return (
    <div className={style.wrapper}>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={desc} />
    </div>
  );
};

export default EmptyData;
