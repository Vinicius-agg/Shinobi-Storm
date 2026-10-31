const PREVENT_DEFAULT = new Set(['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ']);

/** Captura teclado sem depender de bibliotecas externas. */
export class InputController {
  constructor(target = window) {
    this.keys = new Set();
    this.pressed = new Set();
    this.target = target;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  normalize(key) {
    return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
  }

  onKeyDown(event) {
    const key = this.normalize(event.key);
    if (PREVENT_DEFAULT.has(key)) event.preventDefault();
    if (!this.keys.has(key)) this.pressed.add(key);
    this.keys.add(key);
  }

  onKeyUp(event) {
    this.keys.delete(this.normalize(event.key));
  }

  onBlur() {
    this.keys.clear();
    this.pressed.clear();
  }

  isDown(key) { return this.keys.has(this.normalize(key)); }
  wasPressed(key) { return this.pressed.has(this.normalize(key)); }
  endFrame() { this.pressed.clear(); }

  destroy() {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.keys.clear();
    this.pressed.clear();
  }
}
