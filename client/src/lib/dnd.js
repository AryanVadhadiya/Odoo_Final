/**
 * Drag and Drop Utility
 * Provides accessible drag and drop functionality with keyboard support
 * Implements ARIA attributes and keyboard navigation for reordering
 */

/**
 * Drag and Drop Manager Class
 */
export class DragAndDropManager {
  constructor(options = {}) {
    this.options = {
      onReorder: null,
      onDragStart: null,
      onDragEnd: null,
      dragHandleSelector: '[data-drag-handle]',
      dragItemSelector: '[data-drag-item]',
      dropZoneSelector: '[data-drop-zone]',
      ...options
    };
    
    this.isDragging = false;
    this.draggedItem = null;
    this.dragIndex = -1;
    this.dropIndex = -1;
    this.items = [];
    this.itemRefs = new Map();
    
    this.init();
  }

  /**
   * Initialize drag and drop functionality
   */
  init() {
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  /**
   * Set items for drag and drop
   * @param {Array} items - Array of items to manage
   * @param {Array} refs - Array of refs to the DOM elements
   */
  setItems(items, refs) {
    this.items = items;
    this.itemRefs.clear();
    
    refs.forEach((ref, index) => {
      if (ref && ref.current) {
        this.itemRefs.set(index, ref.current);
        this.setupDragItem(ref.current, index);
      }
    });
  }

  /**
   * Setup drag item with event listeners
   * @param {HTMLElement} element - The drag item element
   * @param {number} index - The item index
   */
  setupDragItem(element, index) {
    // Set ARIA attributes
    element.setAttribute('draggable', 'true');
    element.setAttribute('data-drag-item', '');
    element.setAttribute('data-index', index);
    element.setAttribute('aria-grabbed', 'false');
    element.setAttribute('tabindex', '0');
    
    // Add drag event listeners
    element.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
    element.addEventListener('dragenter', (e) => this.handleDragEnter(e, index));
    element.addEventListener('dragover', this.handleDragOver.bind(this));
    element.addEventListener('drop', (e) => this.handleDrop(e, index));
    element.addEventListener('dragleave', this.handleDragLeave.bind(this));
    
    // Add keyboard event listeners
    element.addEventListener('keydown', (e) => this.handleItemKeyDown(e, index));
    element.addEventListener('focus', () => this.handleItemFocus(index));
    element.addEventListener('blur', this.handleItemBlur.bind(this));
  }

  /**
   * Handle drag start
   * @param {DragEvent} event - The drag start event
   * @param {number} index - The item index
   */
  handleDragStart(event, index) {
    this.isDragging = true;
    this.draggedItem = this.items[index];
    this.dragIndex = index;
    
    // Set drag data
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    
    // Update ARIA attributes
    event.target.setAttribute('aria-grabbed', 'true');
    event.target.classList.add('dragging');
    
    // Call callback
    if (this.options.onDragStart) {
      this.options.onDragStart(this.draggedItem, index);
    }
  }

  /**
   * Handle drag enter
   * @param {DragEvent} event - The drag enter event
   * @param {number} index - The item index
   */
  handleDragEnter(event, index) {
    if (this.isDragging && index !== this.dragIndex) {
      this.dropIndex = index;
      event.target.classList.add('drag-over');
      
      // Update ARIA attributes
      event.target.setAttribute('aria-dropeffect', 'move');
    }
  }

  /**
   * Handle drag over
   * @param {DragEvent} event - The drag over event
   */
  handleDragOver(event) {
    if (this.isDragging) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Handle drop
   * @param {DragEvent} event - The drop event
   * @param {number} index - The item index
   */
  handleDrop(event, index) {
    event.preventDefault();
    
    if (this.isDragging && index !== this.dragIndex) {
      // Remove drag-over styling
      event.target.classList.remove('drag-over');
      event.target.removeAttribute('aria-dropeffect');
      
      // Reorder items
      this.reorderItems(this.dragIndex, index);
    }
  }

  /**
   * Handle drag leave
   * @param {DragEvent} event - The drag leave event
   */
  handleDragLeave(event) {
    event.target.classList.remove('drag-over');
    event.target.removeAttribute('aria-dropeffect');
  }

  /**
   * Handle drag end
   * @param {DragEvent} event - The drag end event
   */
  handleDragEnd(event) {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedItem = null;
      this.dragIndex = -1;
      this.dropIndex = -1;
      
      // Clean up styling
      document.querySelectorAll('.dragging, .drag-over').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
        el.removeAttribute('aria-dropeffect');
      });
      
      // Call callback
      if (this.options.onDragEnd) {
        this.options.onDragEnd();
      }
    }
  }

  /**
   * Handle item keyboard events
   * @param {KeyboardEvent} event - The keyboard event
   * @param {number} index - The item index
   */
  handleItemKeyDown(event, index) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.startKeyboardDrag(index);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveItem(index, index - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveItem(index, index + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveItem(index, 0);
        break;
      case 'End':
        event.preventDefault();
        this.moveItem(index, this.items.length - 1);
        break;
    }
  }

  /**
   * Handle item focus
   * @param {number} index - The item index
   */
  handleItemFocus(index) {
    // Update ARIA attributes
    const element = this.itemRefs.get(index);
    if (element) {
      element.setAttribute('aria-selected', 'true');
    }
  }

  /**
   * Handle item blur
   */
  handleItemBlur() {
    // Remove aria-selected from all items
    this.itemRefs.forEach(element => {
      element.removeAttribute('aria-selected');
    });
  }

  /**
   * Start keyboard drag operation
   * @param {number} index - The item index
   */
  startKeyboardDrag(index) {
    this.isDragging = true;
    this.draggedItem = this.items[index];
    this.dragIndex = index;
    
    // Update ARIA attributes
    const element = this.itemRefs.get(index);
    if (element) {
      element.setAttribute('aria-grabbed', 'true');
      element.classList.add('dragging');
    }
    
    // Call callback
    if (this.options.onDragStart) {
      this.options.onDragStart(this.draggedItem, index);
    }
  }

  /**
   * Move item to new position
   * @param {number} fromIndex - Current position
   * @param {number} toIndex - New position
   */
  moveItem(fromIndex, toIndex) {
    if (toIndex >= 0 && toIndex < this.items.length && fromIndex !== toIndex) {
      this.reorderItems(fromIndex, toIndex);
      
      // Focus the moved item
      const element = this.itemRefs.get(toIndex);
      if (element) {
        element.focus();
      }
    }
  }

  /**
   * Reorder items
   * @param {number} fromIndex - Current position
   * @param {number} toIndex - New position
   */
  reorderItems(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    // Create new array with reordered items
    const newItems = [...this.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Update items
    this.items = newItems;
    
    // Call callback
    if (this.options.onReorder) {
      this.options.onReorder(newItems, fromIndex, toIndex);
    }
  }

  /**
   * Get current items
   * @returns {Array} Current items array
   */
  getItems() {
    return this.items;
  }

  /**
   * Check if currently dragging
   * @returns {boolean} True if dragging
   */
  isCurrentlyDragging() {
    return this.isDragging;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('dragend', this.handleDragEnd.bind(this));
    
    // Clean up item event listeners
    this.itemRefs.forEach(element => {
      element.removeEventListener('dragstart', this.handleDragStart.bind(this));
      element.removeEventListener('dragenter', this.handleDragEnter.bind(this));
      element.removeEventListener('dragover', this.handleDragOver.bind(this));
      element.removeEventListener('drop', this.handleDrop.bind(this));
      element.removeEventListener('dragleave', this.handleDragLeave.bind(this));
      element.removeEventListener('keydown', this.handleItemKeyDown.bind(this));
      element.removeEventListener('focus', this.handleItemFocus.bind(this));
      element.removeEventListener('blur', this.handleItemBlur.bind(this));
    });
  }
}

/**
 * Create a new drag and drop manager
 * @param {Object} options - Configuration options
 * @returns {DragAndDropManager} The drag and drop manager instance
 */
export function createDragAndDropManager(options = {}) {
  return new DragAndDropManager(options);
}

/**
 * Utility function to check if drag and drop is supported
 * @returns {boolean} True if drag and drop is supported
 */
export function isDragAndDropSupported() {
  return 'draggable' in document.createElement('div');
}

/**
 * Utility function to check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default DragAndDropManager; 