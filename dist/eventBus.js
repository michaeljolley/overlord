import events from 'events';
export default class EventBus {
    static eventEmitter = new events.EventEmitter();
}
