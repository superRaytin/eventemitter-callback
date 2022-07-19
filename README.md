

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Package tree-shaking](https://badgen.net/bundlephobia/tree-shaking/eventemitter-callback)](https://bundlephobia.com/package/eventemitter-callback)
[![Package minified & gzipped size](https://badgen.net/bundlephobia/minzip/eventemitter-callback)](https://bundlephobia.com/package/eventemitter-callback)
[![Package dependency count](https://badgen.net/bundlephobia/dependency-count/eventemitter-callback)](https://bundlephobia.com/package/eventemitter-callback)

[npm-url]: https://npmjs.org/package/eventemitter-callback
[downloads-image]: http://img.shields.io/npm/dm/eventemitter-callback.svg
[npm-image]: http://img.shields.io/npm/v/eventemitter-callback.svg

# eventemitter-callback
Emit an event and waiting for a result. Based on [eventemitter3](https://github.com/primus/eventemitter3).

## Installation

By package manager:

```sh
npm install eventemitter-callback --save

# For Yarn, use the command below.
yarn add eventemitter-callback
```

Installation from CDN:

```html
<!-- For UNPKG use the code below. -->
<script src="https://unpkg.com/eventemitter-callback"></script>

<!-- For JSDelivr use the code below. -->
<script src="https://cdn.jsdelivr.net/npm/eventemitter-callback"></script>

<script>
  // UMD module is exposed through the "EventEmitterCB" global variable.
  console.log(EventEmitterCB);
</script>
```

## Usage

```js
import emitter from 'eventemitter-callback'
// import * as emitter from 'eventemitter-callback' // type: 'module'

emitter.on('event-name', (arg) => {
  console.log(arg) // prints "ping"
  return 'pong'
})

// emit an event and waiting for its result
emitter.emit('event-name', 'ping', (arg) => {
  console.log(arg) // prints "pong"
})
```

### Disable triggering events before listening

By default, the following works normally:

```js
emitter.emit('msg', 1)
emitter.on('msg', (arg) => {
  console.log(arg) // prints 1
})
```

If this doesn't meet your expectations, you can disable it:

```js
emitter.disablePreEmitter();
emitter.emit('msg', 1)
emitter.on('msg', (arg) => {
  console.log(arg) // will not be called!
})
```

## API

### on(eventName, listener)

Adds the `listener` function to the end of the listeners array for the event named `eventName`.

- **eventName** `string` the name of the event
- **listener** `function` the callback function

The `listener` can be asynchronous. Specified as an `AsyncFunction` or return a `Promise`.

```js
emitter.on('event-name', (arg) => {
  console.log(arg) // prints "ping"
  return new Promise((resolve) => {
    resolve('pong')
  })
})
// emitter.on('event-name', async (arg) => {
//   console.log(arg) // prints "ping"
//   const res = await queryRemote() // suppose res returns 'pong'
//   return res
// })
emitter.emit('event-name', 'ping', (arg) => {
  console.log(arg) // prints "pong"
})
```

### once(eventName, listener)

- **eventName** `string` the name of the event
- **listener** `function` the callback function

Adds a one-time `listener` function for the event named `eventName`.

### emit(eventName[, ...args][, callback])

- **eventName** `string` the name of the event
- **...args** `any`
- **callback** `any` the callback function

Returns `true` if the event had listeners, `false` otherwise.

### emitAll(eventName[, ...args])

- **eventName** `string` the name of the event
- **...args** `any`

Trigger all the listeners at once. Returns a result array by `Promise.all`.

### emitValidateAll(eventName[, ...args])

- **eventName** `string` the name of the event
- **...args** `any`

Trigger all the listeners at once and check the values returned.
Returns `true` if all listeners returns true, `false` otherwise.

### emitValidateAnyOf(eventName[, ...args])

- **eventName** `string` the name of the event
- **...args** `any`

Trigger all the listeners at once and check the values returned.
Returns `true` if either listener returns true, `false` otherwise.

### off(eventName[, listener])

- **eventName** `string` the name of the event
- **listener** `function` the callback function

Removes the specified `listener` from the listener array for the event named `eventName`.

Removes all the listeners for the event:

```js
emitter.off('event-name')
```

### emitter._eventEmitter

Reference to current instance of EventEmitter3.

### emitter._EventEmitter

Reference to constructor of EventEmitter3.

## License

MIT, see the [LICENSE](./LICENSE) file for detail.