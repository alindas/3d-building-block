import styles from './500.less';

export default function WB(props: { error: string }) {
  const handleSubmit = (event: any) => {
    event.preventDefault();
    // 处理表单提交逻辑
    // 可以在这里调用后端 API 来处理错误信息
    window.location.href = '/';
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.content}>{props.error}</div>
        <div className={styles.form}>
          <div className={styles.title}>内部错误</div>
          <form onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label htmlFor="name">姓名：</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="请输入您的姓名"
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="email">邮箱：</label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="请输入您的邮箱"
                required
              />
            </div>
            <div className={styles['form-group']}>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="请输入您的邮箱"
                required
                hidden
              />
            </div>
            <div className={styles['form-group']}>
              <button type="submit">提交错误信息</button>
              <button className={styles['info-btn']}>
                &ensp;返回编辑器&ensp;
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
