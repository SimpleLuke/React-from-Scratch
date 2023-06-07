const RFS = {
  createElement,
  render,
  useState,
};

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;

/**
 * Create a virtual element with the given type, props, and children.
 * @param {string} type - The type of the element (HTML tag name or component function).
 * @param {object} props - The properties or attributes of the element.
 * @param {...any} children - The child elements.
 * @returns {object} - The virtual element.
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        if (typeof child === "boolean") {
          return null;
        }
        return typeof child === "object" ? child : createTextElement(child);
      }),
    },
  };
}

/**
 * Create a virtual text element with the given text value.
 * @param {string} text - The text value.
 * @returns {object} - The virtual text element.
 */
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 * Create the actual DOM element associated with the given fiber.
 * @param {object} fiber - The fiber representing the element.
 * @returns {object} - The created DOM element.
 */
function createDom(fiber) {
  if (!fiber) {
    return;
  }
  const domElement =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(domElement, {}, fiber.props);

  return domElement;
}

/**
 * Update the DOM element with the new properties and event listeners.
 * @param {object} domElement - The DOM element to update.
 * @param {object} prevProps - The previous properties.
 * @param {object} nextProps - The next properties.
 */
function updateDom(domElement, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith("on");
  const isProperty = (key) => key !== "children" && !isEvent(key);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  const isGone = (prev, next) => (key) => !(key in next);

  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      domElement.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      domElement[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      domElement[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      domElement.addEventListener(eventType, nextProps[name]);
    });
}

/**
 * Commit the root fiber and its children to the actual DOM.
 */
function commitRoot() {
  commitWork(wipRoot.child);
  deletions.forEach(commitWork);
  deletions = []; // Clear the array after committing the work

  // Add nodes to root dom
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

/**
 * Commit the given fiber and its children to the actual DOM.
 * @param {object} fiber - The fiber to commit.
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.domElement) {
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.domElement;

  if (fiber.effectTag === "PLACEMENT" && fiber.domElement != null) {
    domParent.appendChild(fiber.domElement);
  } else if (fiber.effectTag === "UPDATE" && fiber.domElement != null) {
    updateDom(fiber.domElement, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * Commit the deletion of the given fiber and its children from the DOM.
 * @param {object} fiber - The fiber to delete.
 * @param {object} domParent - The parent DOM element.
 */
function commitDeletion(fiber, domParent) {
  if (fiber.domElement) {
    domParent.removeChild(fiber.domElement);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

/**
 * Render the given element into the container.
 * @param {object} element - The element to render.
 * @param {object} container - The container element.
 */
function render(element, container) {
  wipRoot = {
    domElement: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

/**
 * Perform the unit of work for the given fiber and return the next fiber to work on.
 * @param {object} fiber - The fiber to perform work on.
 * @returns {object} - The next fiber to work on.
 */
function performUnitOfWork(fiber) {
  if (!fiber) {
    return;
  }
  // Create new node and append to dom
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // Seach for next unit of work. child -> sibling -> uncle(sibling of the parent)
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

/**
 * Update the function component fiber and reconcile its children.
 * @param {object} fiber - The function component fiber.
 */
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const childern = [fiber.type(fiber.props)];
  reconcileChildren(fiber, childern);
}

/**
 * Custom hook for managing state in function components.
 * @param {*} initial - The initial state value.
 * @returns {Array} - A stateful value and a function to update it.
 */
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };

  const setState = (action) => {
    hook.queue.push(action);

    // Schedule a re-render by updating the root fiber
    wipRoot = {
      domElement: currentRoot.domElement,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  // Process state updates
  hook.queue.forEach((action) => {
    if (action instanceof Function) {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  });
  hook.queue = [];

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

/**
 * Update the host component fiber and reconcile its children.
 * @param {object} fiber - The host component fiber.
 */
function updateHostComponent(fiber) {
  // Create the actual DOM element associated with the current fiber if it doesn't already exist.
  if (!fiber.domElement) {
    fiber.domElement = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

/**
 * Reconcile the children of the given fiber with the new elements.
 * @param {object} wipFiber - The fiber to reconcile.
 * @param {Array} elements - The new elements.
 */
function reconcileChildren(wipFiber, elements) {
  if (!wipFiber || !elements) {
    return;
  }
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];

    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      // Update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        domElement: oldFiber.domElement,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    if (element && !sameType) {
      // Add this node
      newFiber = {
        type: element.type,
        props: element.props,
        domElement: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      // Delete the oldFiber's node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

/**
 * The main work loop that performs work until there's no more work or the browser needs to yield.
 * @param {object} deadline - The deadline object from requestIdleCallback.
 */
function workloop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workloop);
}

requestIdleCallback(workloop);

export default RFS;
