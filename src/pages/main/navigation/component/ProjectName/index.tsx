import React from 'react';
import { useSelector } from 'umi';
import style from './index.less';

export default function ProjectName() {
  const projectInfo = useSelector((s: any) => s.project.projectInfo);

  return (
    <div className={style.projectName} title="工程名">
      {projectInfo?.name}
    </div>
  );
}
