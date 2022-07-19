export const isAsyncFunction = (fn) => Object.prototype.toString.call(fn) === '[object AsyncFunction]'

export const isPromise = (obj) => Object.prototype.toString.call(obj) === '[object Promise]'
