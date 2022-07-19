import EventEmitter from 'eventemitter3'
import { isAsyncFunction, isPromise } from './utils'

const eventEmitter = new EventEmitter()

// Collect arguments for the event emit before listening
const preEmitterArgs = {}

// Map for origin listener and corresponse wrapper
const listener2WrapperMap = new Map()

// Map for event name and corresponse listeners
const event2ListenerMap = new Map()

// Used to guarantee that an event will be eventually triggered when the event emit before listening
let emitBeforeListening = true

// Enable triggering events before listening
export const enablePreEmitter = () => {
  emitBeforeListening = true
}

// Disable triggering events before listening
export const disablePreEmitter = () => {
  emitBeforeListening = false
}

// Synchronously calls each of the listeners registered for the event named eventName
export const emit = (eventName, ...args) => {
  const callback = args.pop()
  const _emit = () => {
    const listeners = eventEmitter.listeners(eventName)
    if (listeners.length) {
      return eventEmitter.emit(eventName, ...args)
    }
    if (emitBeforeListening) {
      preEmitterArgs[eventName] = preEmitterArgs[eventName] || []
      preEmitterArgs[eventName].push([...args])
    }
    return false
  }
  if (typeof callback === 'function') {
    eventEmitter.on(`${eventName}-return`, (v) => {
      callback(v)
    })
  } else {
    args.push(callback)
  }
  return _emit()
}

// Trigger all the listeners at once
export const emitAll = (eventName, ...args) => {
  const listeners = eventEmitter.listeners(eventName)
  const promises = listeners.map(listener => new Promise((resolve) => {
    if (isAsyncFunction(listener)) {
      listener(...args).then(res => {
        resolve(res)
      })
    } else {
      const res = listener(...args)
      if (isPromise(res)) {
        res.then((resp) => {
          resolve(resp)
        })
      } else {
        resolve(res)
      }
    }
  }))
  return Promise.all(promises)
}

// Trigger all the listeners at once and check the values returned
// Returns true if all listeners returns true, false otherwise
export const emitValidateAll = async (eventName, ...args) => {
  const emitAllResults = await emitAll(eventName, ...args)
  const res = emitAllResults.filter(item => !!item)
  return emitAllResults.length === res.length
}

// Trigger all the listeners at once and check the values returned
// Returns true if either listener returns true, false otherwise
export const emitValidateAnyOf = async (eventName, ...args) => {
  const emitAllResults = await emitAll(eventName, ...args)
  const res = emitAllResults.filter(item => !!item)
  return !!res.length
}

// Adds the listener function to the end of the listeners array for the event named eventName
export const on = (eventName, listener) => {
  const listenerWrapper = (...args) => {
    if (isAsyncFunction(listener)) {
      return listener(...args).then((res) => {
        eventEmitter.emit(`${eventName}-return`, res)
        return res
      })
    }
    const res = listener(...args)
    if (isPromise(res)) {
      return res.then((resp) => {
        eventEmitter.emit(`${eventName}-return`, resp)
        return resp
      })
    }
    eventEmitter.emit(`${eventName}-return`, res)
    return res
  }

  if (!event2ListenerMap.has(eventName)) event2ListenerMap.set(eventName, [])
  event2ListenerMap.get(eventName).push(listener)
  listener2WrapperMap.set(listener, listenerWrapper)

  if (preEmitterArgs[eventName]) {
    preEmitterArgs[eventName].forEach((args) => {
      listenerWrapper(...args)
    })
  }

  eventEmitter.on(eventName, listenerWrapper)
}

// Adds a one-time listener function for the event named eventName
export const once = (eventName, listener) => {
  const listenerWrapper = (...args) => {
    if (isAsyncFunction(listener)) {
      return listener(...args).then(res => {
        eventEmitter.emit(`${eventName}-return`, res)
        return res
      })
    }
    const res = listener(...args)
    if (isPromise(res)) {
      return res.then((resp) => {
        eventEmitter.emit(`${eventName}-return`, resp)
        return resp
      })
    }
    eventEmitter.emit(`${eventName}-return`, res)
    return res
  }

  if (!event2ListenerMap.has(eventName)) event2ListenerMap.set(eventName, [])
  event2ListenerMap.get(eventName).push(listener)
  listener2WrapperMap.set(listener, listenerWrapper)

  if (preEmitterArgs[eventName]) {
    preEmitterArgs[eventName].forEach((args) => {
      listenerWrapper(...args)
    })
  }

  eventEmitter.once(eventName, listenerWrapper)
}

// Alias for emitter.removeListener()
// Removes the specified listener from the listener array for the event named eventName
export const off = (eventName, listener) => {
  if (listener) {
    if (listener2WrapperMap.has(listener)) {
      eventEmitter.removeListener(eventName, listener2WrapperMap.get(listener))
      listener2WrapperMap.delete(listener)
    }
  } else {
    const listeners = event2ListenerMap.get(eventName)
    listeners.forEach((item) => {
      if (listener2WrapperMap.has(item)) {
        eventEmitter.removeListener(eventName, listener2WrapperMap.get(item))
        listener2WrapperMap.delete(item)
      }
    })
    event2ListenerMap.delete(eventName)
  }
}

// Export instance
export const _eventEmitter = eventEmitter

// Export constructor of EventEmitter3
export const _EventEmitter = EventEmitter
