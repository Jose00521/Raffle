// Increase the default maximum listeners for EventEmitter objects
// This helps prevent "MaxListenersExceededWarning" warnings

const EventEmitter = require('events');

// Set a higher limit for maximum listeners (default is 10 or 20)
// Adjust this value based on your application needs
EventEmitter.defaultMaxListeners = 50;

console.log('EventEmitter defaultMaxListeners set to:', EventEmitter.defaultMaxListeners);

module.exports = EventEmitter; 