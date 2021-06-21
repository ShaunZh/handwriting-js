/*
 * @Description: 实现简易vue-mvvm
 * @Author: Hexon
 * @Date: 2021-06-21 11:26:39
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-21 14:46:41
 */

function defineReactive(obj, key, val) {
  observer(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      return val
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
    }
  })
}

function observer(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  Object.keys(value).forEach(key => {
    defineReactive(value, key, value[key])
  })
}



class Vue {
  constructor(options) {
    this._data = options.data;
    observer(this._data);
  }
}

const vm = new Vue({
  data: {
    person: {
      name: 'hexon',
      age: 30
    },
    job: 'web'
  }
});

vm._data.job = 'work k'



