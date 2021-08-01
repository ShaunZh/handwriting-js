/*
 * @Description:
 * @Author: Hexon
 * @Date: 2021-07-29 11:07:48
 * @LastEditors: Hexon
 * @LastEditTime: 2021-07-31 16:37:49
 */

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  // remove old or change event properties
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  // remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = "";
    });

  // set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = nextProps[key];
    });

  // set new or changed event properties
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

// commit render
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }
  // 递归添加所有的node到dom
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextOfUnitWork = wipRoot;
}

let nextOfUnitWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

// --- concurrent mode ---
/**
 * @description:
 * @param {*} deadline
 * @return {*}
 */
function workLoop(deadline) {
  let shouldYield = false;
  while (nextOfUnitWork && !shouldYield) {
    nextOfUnitWork = performUnitOfWork(nextOfUnitWork);
    // 计算一个执行周期的时间是否到了
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextOfUnitWork && wipRoot) {
    commitRoot();
    console.log("ttt");
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
// --- end concurrent mode ---

/**
 * @description: 1. 创建dom，并添加dom；2. 为elements创建fiber；3. 查找next work，也就是下一个fiber(按深度优先)
 * @param {*} fiber
 * @return {*}
 */
function performUnitOfWork(fiber) {
  // 1. add the element to the DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // 3. select the next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  // 注：下面使用了深度优先搜索算法
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let preSibling = null;
  console.log("oldFiber", oldFiber);
  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 如果oldFiber 与 element 类型相同， 则更新节点
    if (sameType) {
      // todo update this node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // 如果oldFiber 与 element类型不同，且是新的element，则说明要新增一个节点
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    // 如果oldFiber存在，但是类型不同，则要删除节点
    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      preSibling.sibling = newFiber;
    }
    preSibling = newFiber;
    index++;
  }
}

const Didact = {
  createElement,
  render,
};

/** @jsx Didact.createElement */
const container = document.getElementById("root");

const updateValue = (e) => {
  rerender(e.target.value);
};

const rerender = (value) => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );
  Didact.render(element, container);
};

rerender("World");
