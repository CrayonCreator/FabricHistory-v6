export const HistoryMixin = Base => 
  class extends Base {
    /**
     * Initialize history functionality
     */
    _historyInit() {
      this.historyUndo = [];
      this.historyRedo = [];
      this.extraProps = ['selectable', 'editable'];
      this.historyNextState = this._historyNext();
      this.historyProcessing = false;
      this._isMoving = false;

      this._bindHistoryEvents();
    }

    /**
     * Bind all relevant event listeners
     */
    _bindHistoryEvents() {
      this.on({
        'object:added': this._historySaveAction.bind(this),
        'object:removed': this._historySaveAction.bind(this),
        'object:modified': this._handleObjectModified.bind(this),
        'object:skewing': this._historySaveAction.bind(this),
        'path:created': this._historySaveAction.bind(this),  // support drawing paths
        'object:moving': this._objectMoving.bind(this)
      });
    }

    /**
     * Handle object moving start event
     */
    _objectMoving(e) {
      this._isMoving = true;
    }

    /**
     * Handle object modified events, including moving, rotating, and scaling
     */
    _handleObjectModified(e) {
      if (this._isMoving) {
        this._isMoving = false;
        this._historySaveAction(e);
      } else {
        this._historySaveAction(e);
      }
    }

    /**
     * Returns the current state of the canvas as a string
     */
    _historyNext() {
      return JSON.stringify(this.toDatalessJSON(this.extraProps));
    }

    /**
     * Save the current action to history
     */
    _historySaveAction(e) {
      if (this.historyProcessing || this._isMoving) return;
      
      /**
       * Check if there's a target and if it's excluded from history
       */
      if (!e || (e.target && !e.target.excludeFromExport)) {
        const json = this._historyNext();
        
        /**
         * Skip saving if current state equals last saved state to avoid duplicates
         */
        if (this.historyNextState === json) return;
        
        // Save current state to undo history
        this.historyUndo.push(json);
        this.historyNextState = json;
        this.fire('history:append', { json: json });
      }
    }

    /**
     * Undo the last action
     */
    undo(callback) {
      /**
       * If there's no more history to undo, do nothing
       */
      if (this.historyUndo.length <= 1) {
        return;
      }
      /**
       * Start history processing
       */
      this.historyProcessing = true;
      /**
       * Pop current state to redo stack
       */
      const current = this.historyUndo.pop();
      this.historyRedo.push(current);
      /**
       * Get previous available state
       */
      const prev = this.historyUndo[this.historyUndo.length - 1];
      this.historyNextState = prev;
      /**
       * Load previous history state
       */
      this._loadHistory(prev, 'history:undo', callback);
    }

    /**
     * Redo the last undone action
     */
    redo(callback) {
      if (this.historyRedo.length === 0) {
        return;
      }
      this.historyProcessing = true;
      const state = this.historyRedo.pop();
      this.historyUndo.push(state);
      this.historyNextState = state;
      this._loadHistory(state, 'history:redo', callback);
    }

    /**
     * Load a history state
     */
    _loadHistory(history, event, callback) {
      const that = this;
      const wasProcessing = this.historyProcessing;
      
      try {
        // Ensure we're in processing mode to prevent recording new history
        this.historyProcessing = true;
        
        // Clear current canvas content including active selection
        this.discardActiveObject();
        this.clear();
        
        // Parse history JSON if it's a string
        const historyJSON = typeof history === 'string' ? JSON.parse(history) : history;
        
        // Load from history JSON and ensure proper rendering
        this.loadFromJSON(historyJSON, function() {
          // Ensure all objects are rendered
          that.renderAll();
          
          // Force refresh the canvas to ensure correct display
          that.requestRenderAll();
          
          // Fire appropriate event
          that.fire(event);
          
          // Restore original processing flag state
          that.historyProcessing = wasProcessing;
          
          // Execute callback if provided
          if (callback && typeof callback === 'function') {
            callback();
          }
        });
      } catch (error) {
        console.error('Error loading history state:', error);
        // Restore processing flag if there's an error
        this.historyProcessing = wasProcessing;
      }
    }

    /**
     * Save initial state during initialization
     */
    saveInitialState() {
      const json = this._historyNext();
      this.historyUndo = [json];
      this.historyNextState = json;
      this.fire('history:append', { json: json, initial: true });
    }

    /**
     * Clear all undo and redo history
     */
    clearHistory() {
      this.historyUndo = [];
      this.historyRedo = [];
      this.fire('history:clear');
    }

    /**
     * Enable history recording
     */
    onHistory() {
      this.historyProcessing = false;
      this._historySaveAction();
    }

    /**
     * Disable history recording
     */
    offHistory() {
      this.historyProcessing = true;
    }

    /**
     * Check if there are actions that can be undone
     */
    canUndo() {
      return this.historyUndo.length > 0;
    }

    /**
     * Check if there are actions that can be redone
     */
    canRedo() {
      return this.historyRedo.length > 0;
    }

    /**
     * Remove all event listeners
     */
    _historyDispose() {
      this.off({
        'object:added': this._historySaveAction.bind(this),
        'object:removed': this._historySaveAction.bind(this),
        'object:modified': this._handleObjectModified.bind(this),
        'object:skewing': this._historySaveAction.bind(this),
        'path:created': this._historySaveAction.bind(this),
        'object:moving': this._objectMoving.bind(this)
      });
    }
  };

export { CanvasWithHistory, StaticCanvasWithHistory } from './canvas-with-history.js';