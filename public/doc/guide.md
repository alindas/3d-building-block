### 自定义开发脚本（v1.0.0)

接收三个参数，local 是本地环境变量；services 为云端数据，model 为当前模型。

示例一：根据云端数据的 local 数据池改变模型外观，需要返回一个解除脚本的执行方法。

```typescript
function changeColorByStatus(local: any, services: any, model: any) {
  if (!model.isMesh) {
    throw new Error('该模型不具备材质，该效果不会生效');
  }

  const { status } = services.local;

  status.onChange = (val: any) => {
    switch (val) {
      case 'run': {
        model.material.color.set(0x008000);
        break;
      }

      case 'stop': {
        model.material.color.set(0x808080);
        break;
      }

      case 'alarm': {
        model.material.color.set(0xff0000);
        break;
      }

      default:
        break;
    }
  };

  return () => {
    status.onChange = null;
  }

```



