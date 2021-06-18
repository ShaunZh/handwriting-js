/*
 * @Description: 深拷贝
 * @Author: Hexon
 * @Date: 2021-06-17 11:35:33
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-17 14:33:47
 */

function deep(source) {
  if (source instanceof Array || source instanceof Object) {
    const target = source instanceof Array ? [] : {}
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object') {
          target[key] = deep(source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
    return target;
  } else {
    console.error('source is not array | object')
  }
}

var arr = ['a', 'b', 'c']
var targetArr = deep(arr)
