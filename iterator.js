/*
 * @Description: 自定义生成迭代器对象
 * @Author: Hexon
 * @Date: 2021-06-17 15:32:48
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-18 10:52:55
 */

function createIterator(items) {
  let index = 0;
  return {
    next: function () {
      const done = index >= (items.length)
      const value = !done ? items[index++] : undefined
      return {
        value,
        done
      }
    }
  }
}


// 1. 只要数据结构部署有Iterator接口，就可以使用for...of进行遍历，如：Array，Map，Set，String，类数组对象(arguments)
// 2. 而部署Iterator接口就是在数据结构上添加一个Symbol.iterator属性，该属性的值为一个函数，用于生成遍历器，其功能如上createIterator
function forOf(items) {
  const iterator = items[Symbol.iterator]()

  for (let value, res; (res = iterator.next()) && !res.done;) {
    value = res.value
    // 注意：原生for...of方法迭代不同类型的可迭代对象返回的值也不同，如数组、Set——返回value，Map返回key和value
    console.log(value)
  }
}

function testForOf() {
  forOf(['aaa', 'bbb', 'ccc']);
}

function testFuncDefaultParams() {
  let w = 1, z = 2;
  // 此处会报 ReferenceError: z is not defined；
  // 下列代码是关于函数默认值作用域的问题，主要注意一点：一旦设置了参数默认值，函数进行声明初始化时，参数会形成一个单独的作用域, 
  // 等到初始化完成时，该作用域就会消失。
  // 默认参数类似于： let x = z + 1, y = x + 1, z = z + 1，因此默认参数形成的作用域会存在暂时性死区。
  // func函数有三个作用域：1. func外层函数形成的作用域，2. 参数默认值形成的作用域，3. func函数内部作用域
  // 运行时报错的原因：z = z + 1 等于 let z = z + 1，程序会先执行z + 1，又因为已经声明了let z = z + 1，因此形成了暂时性死区，所以，即使外层函数定义了let z = 2，也不会向外层函数的作用域进行查找，因此报错z is not defined；
  function func(x = z + 1, y = x + 1, z = z + 1) {
    console.log(x, y, z)
  }
  func()
}

let z = 2
function defaultParams(x = 1, y = z) {
  console.log(x, y)
}

defaultParams()
testFuncDefaultParams()


function testIterator() {
  const iterator = createIterator(['a', 'b', 'c']);
  console.log(iterator.next())
  console.log(iterator.next())
  console.log(iterator.next())
  console.log(iterator.next())
  console.log(iterator.next())
  console.log(iterator.next())
  console.log(iterator.next())
}
