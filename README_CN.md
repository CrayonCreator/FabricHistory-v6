# fabric-history-v6


Fabric.js 6.x 版本的历史记录（撤销/恢复）实现<br>
本项目参考了<a href="https://github.com/alimozdemir/fabric-history">alimozdemir/fabric-history</a>

## 安装

```bash
npm install fabric-history-v6
```

## 使用方法

由于 Fabric.js 6 采用模块化导入方式，本库提供了两种使用方式：

### 方式一：直接使用带有历史记录功能的 Canvas 类

```javascript
import { CanvasWithHistory } from 'fabric-history-v6/src/canvas-with-history';

// 使用具有历史记录功能的 Canvas 替代原生的 fabric.Canvas
const canvas = new CanvasWithHistory('canvas-id', {
  isDrawingMode: true,
  // 其他 canvas 配置项...
});

// 撤销和恢复操作
canvas.undo();
canvas.redo();

// 检查是否可以撤销或恢复
if (canvas.canUndo()) {
  // 可以撤销
}

if (canvas.canRedo()) {
  // 可以恢复
}
```

### 方式二：使用 HistoryMixin 扩展你自己的 Canvas 类

```javascript
import { Canvas } from 'fabric';
import { HistoryMixin } from 'fabric-history-v6';

// 创建具有历史记录功能的自定义 Canvas 类
class MyCustomCanvas extends HistoryMixin(Canvas) {
  constructor(element, options) {
    super(element, options);
    this._historyInit(); // 初始化历史记录功能
  }
  
  dispose() {
    this._historyDispose(); // 清理历史记录事件监听
    super.dispose();
  }
  
  // 添加你自己的自定义方法...
}

const canvas = new MyCustomCanvas('canvas-id', options);
```

## 快捷键示例

你可以轻松地添加键盘快捷键支持，例如：

```javascript
document.addEventListener('keydown', ({ key, ctrlKey }) => {
  // 检查 Ctrl 键是否按下
  if (!ctrlKey) {
    return;
  }

  // Ctrl+Z 撤销
  if (key === 'z') {
    canvas.undo();
  }

  // Ctrl+Y 恢复
  if (key === 'y') {
    canvas.redo();
  }
});
```

## 排除某些对象不记录历史

可以通过设置对象的 `excludeFromExport` 属性为 `true` 来防止该对象被记入历史记录：

```javascript
const text = new fabric.Text('Hello', {
  excludeFromExport: true // 这个对象的操作不会被记录在历史记录中
});
canvas.add(text);
```

注意：这样做会同时从 JSON 导出或对象导出中排除该对象。

## 事件

- `history:append` - 当历史记录被添加时触发
- `history:undo` - 当执行撤销操作时触发
- `history:redo` - 当执行恢复操作时触发
- `history:clear` - 当清除所有历史记录时触发

## 回调函数

```javascript
canvas.undo(function() { 
  console.log('撤销操作完成');
});

canvas.redo(function() { 
  console.log('恢复操作完成');
});
```

## API 方法

- `undo(callback)` - 撤销最后一次操作
- `redo(callback)` - 重做最后一次被撤销的操作
- `clearHistory()` - 清除所有历史记录
- `onHistory()` - 启用历史记录功能
- `offHistory()` - 暂时禁用历史记录功能
- `canUndo()` - 返回是否可以执行撤销操作
- `canRedo()` - 返回是否可以执行恢复操作