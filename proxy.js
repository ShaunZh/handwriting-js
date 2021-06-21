/*
 * @Description: proxy
 * @Author: Hexon
 * @Date: 2021-06-18 14:42:29
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-18 16:29:50
 */

const proxy = new Proxy({}, {
  get: function (target, propKey, receiver) {
    console.log(`getting ${propKey}!`)
    return Reflect.get(target, propKey, receiver)
  },
  set: function (target, propKey, value, receiver) {
    console.log(`setting ${propKey}: ${value}`)
    return Reflect.set(target, propKey, value, receiver)
  }
})

proxy.count = 1;
proxy.count++;


// 实现数组读取负数的索引
function createArray(...items) {
  let handle = {
    get: function (target, propKey, receiver) {
      const index = Number(propKey)
      if (index < 0) {
        // 在数组中，索引值是数组的属性值，要用字符串表示
        propKey = String(target.length + index)
      }
      return Reflect.get(target, propKey, receiver)
    }
  }
  const arr = [...items]
  return new Proxy(arr, handle)
}

function testCreateArray() {
  let arr = createArray('a', 'b', 'c')
  console.log('arr[-1]', arr[-1])
}

testCreateArray()


// ----- 使用proxy实现链式调用 -----
const window = {}
window.double = v => v * 2
window.pow = v => v * v
window.reverseInt = v => v.toString().split('').reverse().join('') | '0'

function proxyPip() {
  function pip(value) {
    let funcArr = []
    let proxy = new Proxy({}, {
      get: function (target, propKey, receiver) {
        if (propKey === 'get') {
          console.log('get: ', funcArr)
          return funcArr.reduce((acc, func) => {
            return typeof func === 'function' ? func(acc) : acc
          }, value)
        }
        // 注意：因为double、pow和reverseInt绑定在window对象上，因此，该代码只能在浏览器环境运行
        funcArr.push(window[propKey])
        return proxy
      }
    })
    return proxy;
  }
  console.log(pip(3).double.pow.reverseInt.get);
}

if (window) {
  // 该代码只在浏览器环境运行
  proxyPip()
}
// ----- end ------

// ----- proxy生成dom节点  ------
const dom = new Proxy({}, {
  get: function (target, propKey) {
    return function (attrs, ...children) {
      const el = document.createElement(propKey)
      for (let prop of Object.keys(attrs)) {
        el.setAttribute(prop, attrs[prop])
      }
      for (let child of children) {
        if (typeof child === 'string') {
          child = document.createTextNode(child)
        }
        el.appendChild(child)
      }
      return el
    }
  }
})

const domNode = dom.div({},
  'Hello, my name is ',
  dom.a({ href: '//example.com' }, 'Mark'),
  '. I like:',
  dom.ul({},
    dom.li({}, 'The web'),
    dom.li({}, 'Food'),
    dom.li({}, '…actually that\'s it')
  )
)

console.log('domNode: ', domNode)



