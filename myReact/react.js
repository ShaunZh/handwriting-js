/*
 * @Description:
 * @Author: Hexon
 * @Date: 2021-07-29 11:07:48
 * @LastEditors: Hexon
 * @LastEditTime: 2021-07-30 15:50:55
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
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";

  // 将非children属性添加到dom元素上
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = element.props[name]));

  return dom;
}
let nextOfUnitWork = null;

function render(element, container) {
  nextOfUnitWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

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

  if (fiber.parent) {
    fiber.parent.appendChild(fiber.dom);
  }

  // 2. create the fibers for the element's children
  const elements = fiber.props.children;
  let index = 0;
  let preSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      preSibling.sibling = newFiber;
    }
    preSibling = newFiber;
    index += 1;
  }

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

const Didact = {
  createElement,
  render,
};

const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b", null, "加粗123")
);

// const element2 = () => (
//   <div id="foo">
//     <a href="#">bar</a>
//     <b>加粗</b>
//   </div>
// );
const container = document.getElementById("root");
Didact.render(element, container);
