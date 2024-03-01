import events from 'events';

export default abstract class EventBus {
  public static eventEmitter = new events.EventEmitter();
}
