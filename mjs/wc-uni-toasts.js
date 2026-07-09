import { _wcl } from 'https://unpkg.com/uni-input-field/mjs/common-lib.js';
import { _wccss } from 'https://unpkg.com/uni-input-field/mjs/common-css.js';
import {
  colorPalette as _uniColorPalette
} from 'https://unpkg.com/uni-input-field/mjs/uni-css.js';
import Mustache from './mustache.js';

const defaults = {
  maxcount: 3,
  autodismiss: false
};

const booleanAttrs = ['autodismiss'];
const objectAttrs = [];
const custumEvents = {
  'actionClick': 'uni-toasts-action-click'
};
const isVTSupport = !!document.startViewTransition;

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}
${_uniColorPalette}

:host{position:relative;display:block;}

.main {
  --axis-y: var(--uni-toasts-axis-y, 76px);
  --main-gap: 32px;

  @media screen and (max-width: 767px) {
    --main-gap: 16px;
  }

  .toast-container {
    --inset: 0 0 auto 0;
    --padding:
      max(var(--axis-y), var(--safe-area-top))
      max(var(--main-gap), var(--safe-area-right))
      var(--main-gap)
      0
    ;
    --flex-direction: column-reverse;
    --justify-content: center;
    --align-items: end;

    @media screen and (max-width: 767px) {
      --inset: auto 0 0 0;
      --padding:
        var(--main-gap)
        max(var(--main-gap), var(--safe-area-right))
        max(var(--main-gap), var(--safe-area-bottom))
        max(var(--main-gap), var(--safe-area-left))
      ;
      --flex-direction: column;
      --justify-content: center;
      --align-items: center;
    }

    position: fixed;
    inset: var(--inset);
    padding: var(--padding);

    inline-size: 100%;
    box-sizing: border-box;

    display: flex;
    flex-direction: var(--flex-direction);
    justify-content: var(--justify-content);
    align-items: var(--align-items);
    gap: 12px;

    z-index: 2147483647;

    /* popover */
    &:popover-open {
      display: flex;
    }
    border: none;
    background: transparent;
    margin: 0;
    pointer-events: none;
  }
}
</style>

<div class="main" ontouchstart="">
  <slot class="toast-container" popover="manual"></slot>
</div>
`;

const templateToast = document.createElement('template');
templateToast.innerHTML = `
<div id="{{id}}" class="uni-toasts__unit" data-stat="{{stat}}" data-expire="{{expire}}">
  <em class="icon"></em>
  <p class="content line-clampin">{{content}}</p>
  <button type="button" class="action" data-type="action">{{action}}</button>
  <button type="button" class="dismiss" data-type="dismiss">dismiss</button>
</div>
`;

/* style injection */
const styleInjection = `
:root {
  --uni-toast-slide-in-delta: -30px;
  --uni-toast-slide-out-delta: 30px;

  @media screen and (max-width: 767px) {
    --uni-toast-slide-in-delta: 30px;
    --uni-toast-slide-out-delta: -30px;
  }
}

::view-transition-group(root) {
  animation-duration: 0s;
}

::view-transition-image-wrapper(.uni-toast-group) {
  isolation: isolate;
}

::view-transition-old(.uni-toast-group),
::view-transition-new(.uni-toast-group) {
  mix-blend-mode: normal;
  animation-duration: 0s;
}

::view-transition-group(.uni-toast-group) {
  animation-duration: .35s;
  animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

::view-transition-new(.uni-toast-group):only-child {
  animation: uni-toast-slide-in .4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

::view-transition-old(.uni-toast-group):only-child {
  animation: uni-toast-slide-out .25s cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes uni-toast-slide-in {
  from {
    translate: 0 var(--uni-toast-slide-in-delta);
    opacity: 0;
  }
  to {
    translate: 0 0;
    opacity: 1;
  }
}

@keyframes uni-toast-slide-out {
  from {
    translate: 0 0;
    opacity: 1;
  }
  to {
    translate: 0 var(--uni-toast-slide-out-delta);
    opacity: 0;
  }
}

/* toast */
uni-toasts {
  .uni-toasts__unit {
    --background-color: var(--ct_toast_container_success);
    --border-color: var(--ct_toast_stroke_success);
    --icon-color: var(--ct_icon_success_general);
    --icon: path(evenodd, 'M3.42708 12.0001C3.42708 7.27342 7.27375 3.42676 12.0004 3.42676C16.7271 3.42676 20.5737 7.27342 20.5737 12.0001C20.5737 16.7268 16.7271 20.5734 12.0004 20.5734C7.27375 20.5734 3.42708 16.7268 3.42708 12.0001ZM10.6671 13.3601L15.3871 8.59342L16.7471 9.94009L11.3404 15.4001C11.1604 15.5868 10.9138 15.6868 10.6604 15.6868H10.6538C10.3938 15.6868 10.1471 15.5801 9.9671 15.3934L7.19376 12.5134L8.57376 11.1868L10.6671 13.3601Z');
    --action-text-color: var(--ct_text_success_general);

    margin: 0;
    padding: 0;

    &[data-stat=invalid] {
      --background-color: var(--ct_toast_container_error);
      --border-color: var(--ct_toast_stroke_error);
      --icon-color: var(--ct_icon_danger_general);
      --icon: path(evenodd, 'M3.42708 12.0001C3.42708 7.27342 7.27375 3.42676 12.0004 3.42676C16.7271 3.42676 20.5737 7.27342 20.5737 12.0001C20.5737 16.7268 16.7271 20.5734 12.0004 20.5734C7.27375 20.5734 3.42708 16.7268 3.42708 12.0001ZM12.0004 10.6467L14.9138 7.7334L16.2671 9.08673L13.3538 12.0001L16.2671 14.9134L14.9138 16.2667L12.0004 13.3534L9.0871 16.2667L7.73376 14.9134L10.6471 12.0001L7.73376 9.08673L9.0871 7.7334L12.0004 10.6467Z');
      --action-text-color: var(--ct_text_danger_general);
    }

    max-inline-size: calc(100vw - var(--main-gap) * 2);
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    pointer-events: auto;

    padding: 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px 0 rgba(0 0 0/.25);

    view-transition-name: attr(id type(<custom-ident>), none);
    view-transition-class: uni-toast-group;

    .icon {
      flex-shrink: 0;
      inline-size: 24px;
      aspect-ratio: 1/1;

      background-color: var(--icon-color);
      clip-path: var(--icon);
    }

    .content {
      flex-grow: 1;
      max-inline-size: 360px;
      color: var(--ct_text_main_general);
      font-weight: 500;
      line-height: 1.3;

      word-break: break-word;
      hyphens: auto;
      text-wrap: pretty;
      text-autospace: normal;
    }

    button {
      flex-shrink: 0;
      font-size: 0;
      appearance: none;
      box-shadow: unset;
      border: unset;
      background: transparent;
      -webkit-user-select: none;
      user-select: none;
      pointer-events: auto;
      margin: 0;
      padding: 0;
      outline: 0 none;
      align-self: stretch;
    }

    .action {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.3;
      color: var(--action-text-color);
      padding-inline: 8px;
      white-space: nowrap;

      &:empty {
        display: none;
      }
    }

    .dismiss {
      font-size: 0px;

      &::before {
        content: '';
        font-size: 0px;
        inline-size: 20px;
        aspect-ratio: 1/1;
        background-color: var(--ct_icon_main_general);
        clip-path: path('M13.47 14.5987L14.5978 13.4709L11.13 10.0031L14.5977 6.52974L13.47 5.40196L9.99663 8.86975L6.52835 5.40147L5.40057 6.52925L8.86885 10.0031L5.40109 13.4708L6.52887 14.5986L9.99663 11.1309L13.47 14.5987Z');
        display: block;
      }
    }
  }
}
`;

const INJECT_KEY = Symbol.for('uni.toast.ui.injected');
const uiInit = () => {
  if (window[INJECT_KEY]) {
    return;
  }

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styleInjection);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  window[INJECT_KEY] = true;
};
uiInit();

export class UniToasts extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      storage: new Map(),
      iid: ''
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      container: this.shadowRoot.querySelector('.toast-container'),
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new UniToasts(config)
    };

    // evts
    this._onClick = this._onClick.bind(this);
  }

  async connectedCallback() {
   const { config, error } = await _wcl.getWCConfig(this);

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // upgradeProperty
    Object.keys(defaults).forEach((key) => this.#upgradeProperty(key));

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    this.addEventListener('click', this._onClick, { signal });
  }

  disconnectedCallback() {
    clearInterval(this.#data.iid);
    this.#data.controller.abort?.();
  }

  #format(attrName, oldValue, newValue) {
    const hasValue = newValue !== null;

    if (!hasValue) {
      if (booleanAttrs.includes(attrName)) {
        this.#config[attrName] = false;
      } else {
        this.#config[attrName] = defaults[attrName];
      }
    } else {
      switch (attrName) {
        case 'maxcount': {
          const count = +newValue;
          this.#config[attrName] = (isNaN(count) || count <= 2 || count > 20) ? defaults.maxcount : count;
          break;
        }

        case 'autodismiss':
          this.#config[attrName] = true;
          break;
      }
    }
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!UniToasts.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'autodismiss': {
        clearInterval(this.#data.iid);

        if (this.autodismiss) {
          this.#setCurtainCall();
        }
        break;
      }
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // UniToasts.observedAttributes
  }

  static get supportedEvents() {
    return Object.keys(custumEvents).map(
      (key) => {
        return custumEvents[key];
      }
    );
  }

  #upgradeProperty(prop) {
    let value;

    if (UniToasts.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  set maxcount(value) {
    if (value) {
      this.setAttribute('maxcount', value);
    } else {
      this.removeAttribute('maxcount');
    }
  }

  get maxcount() {
    return this.#config.maxcount;
  }

  set autodismiss(value) {
    this.toggleAttribute('autodismiss', Boolean(value));
  }

  get autodismiss() {
    return this.#config.autodismiss;
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  async _onClick(evt) {
    const { target } = evt;
    const button = target.closest('button');

    if (!button) {
      return;
    }

    evt.preventDefault();

    const toast = target.closest('.uni-toasts__unit');
    const updateDOM = () => {
      this.#data.storage.delete(toast.id);
      toast.remove();
    };

    switch (button.dataset.type) {
      case 'dismiss': {
        if (isVTSupport) {
          const transition = document.startViewTransition(() => {
            updateDOM();
          });

          try {
            await transition.finished;
          } catch (e) {
            if (e.name !== 'AbortError') console.error(e);
          }
        } else {
          updateDOM();
        }
        break;
      }

      case 'action': {
        const params = this.#data.storage.get(toast.id);
        this.#fireEvent(custumEvents.actionClick, { ...params });
        break;
      }
    }
  }

  #toastExpireCheck = async () => {
    const existToasts = Array.from(this.querySelectorAll('.uni-toasts__unit'));
    const now = +new Date();

    const expiredToasts = existToasts.filter(
      (toast) => {
        return now > +toast.dataset.expire;
      }
    );

    const updateAllExpiredDOM = () => {
      expiredToasts.forEach(
        (toast) => {
          this.#data.storage.delete(toast.id);
          toast.remove();
        }
      );
    };

    if (expiredToasts.length > 0) {
      if (isVTSupport) {
        const transition = document.startViewTransition(() => {
          updateAllExpiredDOM();
        });

        try {
          await transition.finished;
        } catch (e) {
          if (e.name !== 'AbortError') console.error(e);
        }
      } else {
        updateAllExpiredDOM();
      }
    }

    this.#dismissCheck();
  };

  #setCurtainCall() {
    clearInterval(this.#data.iid);

    this.#data.iid = setInterval(
      this.#toastExpireCheck
    , 1000);
  }

  #dismissCheck() {
    if (this.querySelector('.uni-toasts__unit')) {
      return;
    }

    clearInterval(this.#data.iid);
    this.#nodes.container.hidePopover();
  }

  show(content = '', option = {}) {
    option = {
      stat: 'valid',
      action: '',
      params: {}, // for action click
      ...option
    };

    clearInterval(this.#data.iid);

    const now = +new Date();
    const id = `toast-${window.crypto.randomUUID()}`;
    const toastString = Mustache.render(templateToast.innerHTML, {
      id,
      stat: ['valid', 'invalid'].includes(option.stat) ? option.stat : 'valid',
      content,
      action: option.action || '',
      expire: now + (option.action ? 6000 : 3000)
    });

    // store params
    this.#data.storage.set(id, window.structuredClone(option.params));

    const tempDiv = document.createElement('div');
    tempDiv.insertAdjacentHTML('afterbegin', toastString);
    const toast = tempDiv.firstElementChild;

    // show popover
    this.#nodes.container.showPopover();

    const updateDOM = () => {
      const existToasts = Array.from(this.querySelectorAll('.uni-toasts__unit'));

      if (existToasts.length + 1 > this.maxcount) {
        existToasts.slice(0, existToasts.length + 1 - this.maxcount).forEach(
          (unit) => {
            this.#data.storage.delete(unit.id);
            unit.remove();
          }
        );
      }

      this.appendChild(toast);
    };

    if (isVTSupport) {
      document.startViewTransition(() => {
        updateDOM();
      });
    } else {
      updateDOM();
    }

    if (this.autodismiss) {
      this.#setCurtainCall();
    }
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('UniToasts');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('UniToasts'), UniToasts);
}