/* eslint-disable no-param-reassign */

const supportedInputTypes = [
  'color',
  'date',
  'datetime',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'range',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week',
];

// Do not try to delete non-configurable properties.
// Value and checked properties on DOM elements are non-configurable in PhantomJS.
const deletePropertySafe = (elem, prop) => {
  const desc = Object.getOwnPropertyDescriptor(elem, prop);
  if (desc && desc.configurable) {
    delete elem[prop];
  }
};

const triggerChangeEvent = (node) => {
  const nodeName = node.nodeName.toLowerCase();
  const { type } = node;

  if (
    (nodeName === 'input' && supportedInputTypes.indexOf(type) >= 0) ||
    nodeName === 'textarea'
  ) {
    // React 16
    // Cache artificial value property descriptor.
    // Property doesn't exist in React <16, descriptor is undefined.
    const descriptor = Object.getOwnPropertyDescriptor(node, 'value');

    // Store initial value before triggering the focus event
    const initialValue = node.value;

    // React 0.14: IE9
    // React 15: IE9-IE11
    // React 16: IE9
    // Dispatch focus.
    let event = document.createEvent('UIEvents');
    event.initEvent('focus', false, false);
    node.dispatchEvent(event);

    // React 0.14: IE9
    // React 15: IE9-IE11
    // React 16
    // In IE9-10 imperative change of node value triggers propertychange event.
    // Update inputValueTracking cached value.
    // Remove artificial value property.
    // Restore initial value to trigger event with it.
    node.value = `${initialValue}#`;
    deletePropertySafe(node, 'value');
    node.value = initialValue;
    // React 15: IE11
    // For unknown reason React 15 added listener for propertychange with addEventListener.
    // This doesn't work, propertychange events are deprecated in IE11,
    // but allows us to dispatch fake propertychange which is handled by IE11.
    event = document.createEvent('HTMLEvents');
    event.initEvent('propertychange', false, false);
    event.propertyName = 'value';
    node.dispatchEvent(event);
    // React 0.14: IE10-IE11, non-IE
    // React 15: non-IE
    // React 16: IE10-IE11, non-IE
    event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, false);
    node.dispatchEvent(event);

    event = document.createEvent('UIEvents');
    event.initEvent('blur', false, false);
    node.dispatchEvent(event);
    // React 16
    // Restore artificial value property descriptor.
    if (descriptor) {
      Object.defineProperty(node, 'value', descriptor);
    }
  }
};

export default triggerChangeEvent;
