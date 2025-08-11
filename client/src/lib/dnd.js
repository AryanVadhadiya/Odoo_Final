// Drag and Drop utility for accessible reordering
export class DragAndDropManager {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemSelector: '[data-dnd-item]',
      handleSelector: '[data-dnd-handle]',
      dragClass: 'dnd-dragging',
      dropClass: 'dnd-drop-zone',
      ...options
    };

    this.draggedElement = null;
    this.dragIndex = -1;
    this.dropIndex = -1;
    this.isDragging = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupKeyboardNavigation();
  }

  bindEvents() {
    // Mouse events
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Touch events
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Keyboard events
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  setupKeyboardNavigation() {
    const items = this.container.querySelectorAll(this.options.itemSelector);

    items.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Item ${index + 1}, press Space to start dragging, use arrow keys to move`);

      // Add move up/down buttons for keyboard users
      const moveUpBtn = document.createElement('button');
      moveUpBtn.className = 'sr-only';
      moveUpBtn.setAttribute('aria-label', 'Move item up');
      moveUpBtn.onclick = () => this.moveItem(index, index - 1);

      const moveDownBtn = document.createElement('button');
      moveDownBtn.className = 'sr-only';
      moveDownBtn.setAttribute('aria-label', 'Move item down');
      moveDownBtn.onclick = () => this.moveItem(index, index + 1);

      item.appendChild(moveUpBtn);
      item.appendChild(moveDownBtn);
    });
  }

  handleMouseDown(event) {
    const handle = event.target.closest(this.options.handleSelector);
    if (!handle) return;

    event.preventDefault();
    this.startDrag(event.target.closest(this.options.itemSelector), event.clientY);
  }

  handleMouseMove(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    this.updateDragPosition(event.clientY);
  }

  handleMouseUp(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    this.endDrag();
  }

  handleTouchStart(event) {
    const handle = event.target.closest(this.options.handleSelector);
    if (!handle) return;

    const touch = event.touches[0];
    this.startDrag(event.target.closest(this.options.itemSelector), touch.clientY);
  }

  handleTouchMove(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    const touch = event.touches[0];
    this.updateDragPosition(touch.clientY);
  }

  handleTouchEnd(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    this.endDrag();
  }

  handleKeyDown(event) {
    const item = event.target.closest(this.options.itemSelector);
    if (!item) return;

    const index = Array.from(this.container.querySelectorAll(this.options.itemSelector)).indexOf(item);

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.startDrag(item, 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveItem(index, index - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveItem(index, index + 1);
        break;
      case 'Escape':
        if (this.isDragging) {
          event.preventDefault();
          this.cancelDrag();
        }
        break;
    }
  }

  startDrag(element, clientY) {
    this.draggedElement = element;
    this.dragIndex = Array.from(this.container.querySelectorAll(this.options.itemSelector)).indexOf(element);
    this.isDragging = true;

    element.classList.add(this.options.dragClass);
    element.setAttribute('aria-grabbed', 'true');

    // Create drag preview
    this.createDragPreview(element, clientY);

    // Add drop zones
    this.addDropZones();
  }

  updateDragPosition(clientY) {
    if (!this.draggedElement) return;

    const items = this.container.querySelectorAll(this.options.itemSelector);
    const containerRect = this.container.getBoundingClientRect();
    const relativeY = clientY - containerRect.top;

    let newIndex = 0;
    for (let i = 0; i < items.length; i++) {
      const itemRect = items[i].getBoundingClientRect();
      const itemTop = itemRect.top - containerRect.top;
      const itemBottom = itemRect.bottom - containerRect.top;

      if (relativeY >= itemTop && relativeY <= itemBottom) {
        newIndex = i;
        break;
      }
    }

    if (newIndex !== this.dropIndex) {
      this.updateDropZones(newIndex);
      this.dropIndex = newIndex;
    }
  }

  endDrag() {
    if (!this.isDragging) return;

    if (this.dropIndex !== -1 && this.dropIndex !== this.dragIndex) {
      this.moveItem(this.dragIndex, this.dropIndex);
    }

    this.cleanup();
  }

  cancelDrag() {
    this.cleanup();
  }

  moveItem(fromIndex, toIndex) {
    const items = Array.from(this.container.querySelectorAll(this.options.itemSelector));

    if (fromIndex < 0 || fromIndex >= items.length ||
        toIndex < 0 || toIndex >= items.length) {
      return;
    }

    const item = items[fromIndex];
    const targetPosition = items[toIndex];

    if (fromIndex < toIndex) {
      targetPosition.parentNode.insertBefore(item, targetPosition.nextSibling);
    } else {
      targetPosition.parentNode.insertBefore(item, targetPosition);
    }

    // Update indices
    this.updateIndices();

    // Trigger reorder event
    this.triggerReorderEvent(fromIndex, toIndex);
  }

  updateIndices() {
    const items = this.container.querySelectorAll(this.options.itemSelector);
    items.forEach((item, index) => {
      item.setAttribute('data-index', index);
      item.setAttribute('aria-label', `Item ${index + 1}, press Space to start dragging, use arrow keys to move`);
    });
  }

  createDragPreview(element, clientY) {
    // Implementation for visual drag preview
    // This can be customized based on design requirements
  }

  addDropZones() {
    const items = this.container.querySelectorAll(this.options.itemSelector);
    items.forEach((item, index) => {
      if (index !== this.dragIndex) {
        item.classList.add(this.options.dropClass);
        item.setAttribute('aria-dropeffect', 'move');
      }
    });
  }

  updateDropZones(newIndex) {
    const items = this.container.querySelectorAll(this.options.itemSelector);
    items.forEach((item, index) => {
      if (index !== this.dragIndex) {
        item.classList.remove(this.options.dropClass);
        item.classList.add(this.options.dropClass);
      }
    });
  }

  cleanup() {
    if (this.draggedElement) {
      this.draggedElement.classList.remove(this.options.dragClass);
      this.draggedElement.setAttribute('aria-grabbed', 'false');
    }

    const items = this.container.querySelectorAll(this.options.itemSelector);
    items.forEach(item => {
      item.classList.remove(this.options.dropClass);
      item.removeAttribute('aria-dropeffect');
    });

    this.draggedElement = null;
    this.dragIndex = -1;
    this.dropIndex = -1;
    this.isDragging = false;
  }

  triggerReorderEvent(fromIndex, toIndex) {
    const event = new CustomEvent('dnd:reorder', {
      detail: { fromIndex, toIndex }
    });
    this.container.dispatchEvent(event);
  }

  destroy() {
    this.cleanup();

    // Remove event listeners
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mouseup', this.handleMouseUp);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }
}

// Utility function to create DnD manager
export const createDragAndDrop = (container, options) => {
  return new DragAndDropManager(container, options);
};

// Export default class
export default DragAndDropManager;
