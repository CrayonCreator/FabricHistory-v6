/**
 * Canvas classes with history functionality for Fabric.js 6
 */
import { Canvas, StaticCanvas } from 'fabric';
import { HistoryMixin } from './index.js';

// Canvas with history capabilities
export const CanvasWithHistory = class extends HistoryMixin(Canvas) {
  constructor(element, options) {
    super(element, options);
    // Initialize history tracking
    this._historyInit();
    
    // 延迟一帧保存初始状态，确保画布完全加载
    setTimeout(() => {
      this.saveInitialState();
    }, 0);
  }

  dispose() {
    // Clean up history event listeners before disposal
    this._historyDispose();
    super.dispose();
  }
};

// StaticCanvas with history capabilities
export const StaticCanvasWithHistory = class extends HistoryMixin(StaticCanvas) {
  constructor(element, options) {
    super(element, options);
    // Initialize history tracking
    this._historyInit();
    
    // 延迟一帧保存初始状态，确保画布完全加载
    setTimeout(() => {
      this.saveInitialState();
    }, 0);
  }

  dispose() {
    // Clean up history event listeners before disposal
    this._historyDispose();
    super.dispose();
  }
};