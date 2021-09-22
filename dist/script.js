function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}class FluentButton {

  constructor(rootEl, { text, icon, outerReveal, onClick }) {
    this.rootEl = typeof rootEl === 'string' ? document.querySelector(rootEl) : rootEl;
    if (FluentButton.elements.has(this.rootEl)) return;
    FluentButton.elements.add(this.rootEl);

    this.rootEl.innerHTML = FluentButton.createHTML({ text, icon });
    this.el = this.rootEl.firstElementChild;

    if (onClick) this.el.addEventListener('click', onClick);
    this.el.addEventListener('touchstart', this.startRipple);
    this.el.addEventListener('mousedown', this.startRipple);
    this.el.onmousedown = this.el.ontouchstart = this.addPressedState;
    this.el.onmouseup = this.el.onmouseleave = this.el.ontouchend = this.removePressedState;

    if (!outerReveal) this.el.onmousemove = this.updateCoordinates;else
    {
      FluentButton.outerRevealElements.set(this.el, this.getElementDimensions(this.el));
      if (!FluentButton.observingOuterReveal) this.observeOuterReveal();
    }
  }

  updateCoordinates({ pageX, pageY, currentTarget }) {
    const x = pageX - currentTarget.offsetLeft;
    const y = pageY - currentTarget.offsetTop;

    currentTarget.style.setProperty('--x', `${x}px`);
    currentTarget.style.setProperty('--y', `${y}px`);

    return { x, y };
  }

  startRipple({ currentTarget }) {
    currentTarget.classList.remove('fluent-btn--ripple'); // remove prev
    // Add again to (re)start animation
    setTimeout(() => currentTarget.classList.add('fluent-btn--ripple'), 25);
  }
  addPressedState({ currentTarget }) {
    currentTarget.classList.add('fluent-btn--pressed');
  }
  removePressedState({ currentTarget }) {
    currentTarget.classList.remove('fluent-btn--pressed');
  }

  observeOuterReveal() {
    FluentButton.observingOuterReveal = true;

    window.addEventListener('resize', this.updateElementDimensions.bind(this));
    window.addEventListener('mousemove', event => {
      window.requestAnimationFrame(this.updateOuterReveal.bind(this, event));
    });
    window.addEventListener('touchmove', ({ touches }) => {
      const [{ clientX, clientY }] = touches;
      const position = { pageX: clientX, pageY: clientY };
      window.requestAnimationFrame(this.updateOuterReveal.bind(this, position));
    });
  }

  updateOuterReveal({ pageX, pageY }) {
    for (const [el, { width, height }] of FluentButton.outerRevealElements) {
      const { x, y } = this.updateCoordinates({ pageX, pageY, currentTarget: el });

      if (this.isInRevealThreshold({ x, y, width, height })) {
        el.classList.add('fluent-btn--reveal');
      } else {
        el.classList.remove('fluent-btn--reveal');
      }
    }
  }

  isInRevealThreshold({ x, y, width, height }) {
    const threshold = FluentButton.outerRevealThreshold;
    return (
      x > -threshold && x < width + threshold &&
      y > -threshold && y < height + threshold);

  }

  getElementDimensions(el) {
    const { width, height } = el.getBoundingClientRect();
    return { width, height };
  }
  updateElementDimensions() {
    for (const [el] of FluentButton.outerRevealElements) {
      FluentButton.outerRevealElements.set(el, this.getElementDimensions(el));
    }
  }

  destroy() {
    this.rootEl.innerHTML = '';
    FluentButton.outerRevealElements.delete(this.el);
    FluentButton.elements.delete(this.rootEl);
  }}
















/* *** */_defineProperty(FluentButton, "elements", new Set());_defineProperty(FluentButton, "outerRevealElements", new Map());_defineProperty(FluentButton, "outerRevealThreshold", 75);_defineProperty(FluentButton, "observingOuterReveal", false);_defineProperty(FluentButton, "createHTML", ({ text, icon }) => `
    <div class="fluent-btn">
      <button class="fluent-btn__btn">
        <span class="fluent-btn__icon" style="background-image: url(${icon})"></span>
        <span class="fluent-btn__txt">${text}</span>
      </button>
    </div>`);const headingEl = document.querySelector('h1');const heading = headingEl.textContent;document.body.addEventListener('click', ({ target }) => {if (!target.matches('.fluent-btn__btn')) headingEl.textContent = heading;
});

document.querySelectorAll('[data-fluent-text]').forEach(element => {
  new FluentButton(element, {
    text: element.dataset.fluentText,
    icon: element.dataset.fluentIcon,
    outerReveal: true,
    onClick: () => headingEl.textContent = element.dataset.fluentText });

});