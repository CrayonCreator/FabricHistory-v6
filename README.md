# fabric-history-v6

<a href="./README_CN.md">中文readme</a>

History (undo/redo) implementation for Fabric.js 6.x<br>
This project is based on <a href="https://github.com/alimozdemir/fabric-history">alimozdemir/fabric-history</a>


## Installation

```bash
npm install fabric-history-v6
```

## Usage

This library provides two ways to integrate with Fabric.js 6 modular imports:

### Method 1: Use CanvasWithHistory directly

```javascript
import { CanvasWithHistory } from 'fabric-history-v6';

const canvas = new CanvasWithHistory('canvas-id', {
  isDrawingMode: true,
  // other Fabric.js canvas options...
});

canvas.undo();
canvas.redo();

if (canvas.canUndo()) { /* can undo */ }
if (canvas.canRedo()) { /* can redo */ }
```

### Method 2: Extend your own Canvas with HistoryMixin

```javascript
import { Canvas } from 'fabric';
import { HistoryMixin } from 'fabric-history-v6';

class MyCanvas extends HistoryMixin(Canvas) {
  constructor(el, options) {
    super(el, options);
    this._historyInit();
  }

  dispose() {
    this._historyDispose();
    super.dispose();
  }
}

const canvas = new MyCanvas('canvas-id', options);
```

## Keyboard shortcuts example

```javascript
document.addEventListener('keydown', ({ key, ctrlKey }) => {
  if (!ctrlKey) return;
  if (key === 'z') canvas.undo();
  if (key === 'y') canvas.redo();
});
```

## Excluding objects from history

Set `excludeFromExport: true` on an object to skip recording its actions:

```javascript
const text = new fabric.Text('Hello', { excludeFromExport: true });
canvas.add(text);
```

## Events

- `history:append` – triggered when a new state is added
- `history:undo` – triggered after undo
- `history:redo` – triggered after redo
- `history:clear` – triggered when history is cleared

## API

- `undo(callback)` – undo last action
- `redo(callback)` – redo last undone action
- `clearHistory()` – clear all history
- `onHistory()` – enable history recording
- `offHistory()` – disable history recording
- `canUndo()` – return boolean
- `canRedo()` – return boolean