/*
 * @Description: 实现简易vue-mvvm
 * @Author: Hexon
 * @Date: 2021-06-21 11:26:39
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-21 15:08:33
 */

function defineReactive(obj, key, val) {
  let dep = new Dep()
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
      dep.notify()
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

function Dep() {
  this.deps = []
}

Dep.prototype.add = function (sub) {
  this.deps.push(sub)
}

Dep.prototype.notify = function (v) {
  this.deps.forEach(function (sub) {
    sub.update(v)
  })
}

// 监听函数：监听到数据改变后会调用update函数
function Watcher(fn) {
  this.fn = fn;
}

Watcher.prototype.update = function (v) {
  this.fn(v);
}

const watcher = new Watcher(v => console.log('watcher ', v))

const dep = new Dep()
dep.add(watcher)
dep.add(watcher)
dep.notify('update')


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



