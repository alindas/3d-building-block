import React from 'react';
import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function Question(props: { content?: string; link?: string }) {
  function linkGuideBook() {
    if (props.link) {
      window.open(props.link);
    }
  }

  return (
    <Popover content={props.content ?? null} trigger="click" placement="bottom">
      &ensp;
      <QuestionCircleOutlined onClick={linkGuideBook} /> &ensp;
    </Popover>
  );
}
