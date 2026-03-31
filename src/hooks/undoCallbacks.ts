type UndoCallbackFn = (() => void) | null

interface UndoCallbacks {
  pushImmediate: UndoCallbackFn
  pushDebounced: UndoCallbackFn
  beginTransaction: UndoCallbackFn
  commitTransaction: UndoCallbackFn
}

/**
 * Shared ref for undo/redo callbacks.
 *
 * This is intentionally module-level rather than passed through React Context
 * because it must be accessible from imperative event handlers (drag callbacks,
 * pointer-move listeners on `window`) that run outside the React tree. The
 * callbacks are assigned once by the provider that owns the undo stack and
 * read-only everywhere else.
 */
export const undoCallbacks: UndoCallbacks = {
  pushImmediate: null,
  pushDebounced: null,
  beginTransaction: null,
  commitTransaction: null,
}
