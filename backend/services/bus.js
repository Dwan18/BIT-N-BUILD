import { EventEmitter } from 'node:events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

  publish(eventId, eventType, data) {
    this.emit(`event:${eventId}`, { event: eventType, data });
  }

  subscribe(eventId, callback) {
    const channel = `event:${eventId}`;
    this.on(channel, callback);
    return () => this.off(channel, callback);
  }
}

export const bus = new EventBus();
