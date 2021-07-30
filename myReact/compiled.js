/*
 * @Description:
 * @Author: Hexon
 * @Date: 2021-07-29 11:07:48
 * @LastEditors: Hexon
 * @LastEditTime: 2021-07-30 13:50:06
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: { ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    }
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function render(element, container) {
  const dom = element.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);

  const isProperty = key => key !== "children"; // 将非children属性添加到dom元素上


  Object.keys(element.props).filter(isProperty).forEach(name => dom[name] = element.props[name]); // 递归渲染

  element.props.children.forEach(child => render(child, dom));
  container.appendChild(dom);
}

const Didact = {
  createElement,
  render
};
const element = Didact.createElement("div", {
  id: "foo"
}, Didact.createElement("a", null, "bar"), Didact.createElement("b", null, "加粗123")); // const element2 = () => (
//   <div id="foo">
//     <a href="#">bar</a>
//     <b>加粗</b>
//   </div>
// );

const container = document.getElementById("root");
Didact.render(element, container);