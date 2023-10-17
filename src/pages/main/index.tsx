import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import Navigation from './navigation';
import Scene from './scene';
import Wealth from './wealth';
import Attribute from './attribute';
import './index.less';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/pages/error/500';

type ListProps = {
  listId: string;
  Component: React.ComponentClass<any> | React.FC<any>;
  sort: string[];
  onSort: (e: any) => any;
};

function List(props: ListProps) {
  const { listId, Component, sort, onSort } = props;

  return (
    <Droppable droppableId={listId}>
      {(provided) => (
        <Component
          {...provided.droppableProps}
          ref={provided.innerRef}
          sequence={sort}
          onSort={onSort}
        >
          {provided.placeholder}
        </Component>
      )}
    </Droppable>
  );
}

function MainPage() {
  const [wealthSequence, setWealthSequence] = useState<string[]>([]);
  const [attrSequence, setAttrSequence] = useState<string[]>([]);

  function onDragEnd(result: any) {
    console.log(result);

    // 如果放开位置不在 Droppable 上下文内
    if (result.destination === null) {
      return;
    }

    // 如果拖拽区域为左侧资产库
    if (
      result.source.droppableId === 'wealth' &&
      result.destination.droppableId === 'wealth'
    ) {
      let res = wealthSequence.filter((item) => item != result.draggableId);
      res.splice(result.destination.index, 0, result.draggableId);
      // 本地储存
      localStorage.setItem('wealthSort', JSON.stringify(res));
      setWealthSequence(res);
    }

    // 如果拖拽区域为右侧属性编辑器
    if (
      result.source.droppableId === 'attribute' &&
      result.destination.droppableId === 'attribute'
    ) {
      let res = attrSequence.filter((item) => item != result.draggableId);
      res.splice(result.destination.index, 0, result.draggableId);

      localStorage.setItem('attribute', JSON.stringify(res));
      setAttrSequence(res);
    }
  }

  return (
    <div className="container">
      <div className="navigation-wrap">
        {/* 菜单 */}
        <Navigation />
      </div>

      <div className="mainContent">
        {/* 内容 */}
        <div className="mainContent-wrap">
          <DragDropContext onDragEnd={(res) => onDragEnd(res)}>
            <div className="mainContent-wrap-tree">
              {/* 模型资产区域 */}
              <List
                listId="wealth"
                Component={Wealth}
                sort={wealthSequence}
                onSort={setWealthSequence}
              />
            </div>

            <div className="mainContent-wrap-scene">
              {/* 3D编辑区域 */}
              <Scene />
            </div>

            <div className="mainContent-wrap-attribute">
              {/* 属性编辑区域 */}
              <List
                listId="attribute"
                Component={Attribute}
                sort={attrSequence}
                onSort={setAttrSequence}
              />
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}

function MainIndex() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MainPage></MainPage>
    </ErrorBoundary>
  );
}

export default MainIndex;
