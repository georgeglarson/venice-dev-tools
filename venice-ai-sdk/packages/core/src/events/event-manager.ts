import { EventEmitter } from 'eventemitter3';

/**
 * Manages events for the Venice AI SDK.
 * Provides methods for subscribing to and emitting events.
 */
export class EventManager {
  /**
   * The event emitter instance.
   */
  private events: EventEmitter;

  /**
   * Create a new event manager.
   */
  constructor() {
    this.events = new EventEmitter();
  }

  /**
   * Subscribe to an event.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This event manager instance.
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.events.on(event, listener);
    return this;
  }

  /**
   * Subscribe to an event for one-time execution.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This event manager instance.
   */
  public once(event: string, listener: (...args: any[]) => void): this {
    this.events.once(event, listener);
    return this;
  }

  /**
   * Unsubscribe from an event.
   * @param event - The event name.
   * @param listener - The event listener.
   * @returns This event manager instance.
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.events.off(event, listener);
    return this;
  }

  /**
   * Emit an event.
   * @param event - The event name.
   * @param args - The event arguments.
   * @returns Whether the event had listeners.
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.events.emit(event, ...args);
  }

  /**
   * Remove all listeners for an event.
   * @param event - The event name (optional, if not provided, removes all listeners).
   * @returns This event manager instance.
   */
  public removeAllListeners(event?: string): this {
    this.events.removeAllListeners(event);
    return this;
  }

  /**
   * Get the number of listeners for an event.
   * @param event - The event name.
   * @returns The number of listeners.
   */
  public listenerCount(event: string): number {
    return this.events.listenerCount(event);
  }
}

export default EventManager;