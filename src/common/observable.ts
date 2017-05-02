type Observer = (msg?: any) => void;

export class Observable {
    observers: { [type: string]: Observer[] } = {};
    lastMessages: { [type: string]: string } = {};

    constructor() {
    } // constructor

    /**
     * Add an observer to a type of message
     *
     * @param   {string}   type       Type of messages the observer subscribes to
     * @param   {Observer} observer   Observer
     * @returns {Observer}            Observer
     */
    add(type: string, observer: Observer, getLastMessage: boolean = false): Observer {
        if (!(type in this.observers)) {
            this.observers[type] = [];
        }
        this.observers[type].push(observer);
        if (getLastMessage) {
          observer(this.lastMessages[type]);
        }
        return observer;
    } // add

    /**
     * Remove an observer from a type of message
     *
     * @param   {string}   type       Type of messages the observer subscribes to
     * @param   {Observer} observer   Observer
     * @returns {void}
     */
    remove(type: string, observer: Observer): void {
        if (this.observers[type]) {
            for (let i = 0; i < this.observers[type].length; i++) {
                if (observer === this.observers[type][i]) {
                    this.observers[type].splice(i, 1);
                    return;
                }
            } // for i
        }
    } // removeObserver

    /**
     * Remove all observers from a type of message
     *
     * @param   {string}   type       Type of messages the observers subscribe to
     * @returns {void}
     */
    removeAll(type: string): void {
        delete this.observers[type];
    } // removeObserversType

    /**
     * Send a message to observers
     *
     * @param   {string} type    Type of message to be sent to observers
     * @param   {*}      [msg]   Content of the message
     * @returns {void}
     */
    notify(type: string, msg?: any): void {
        this.lastMessages[type] = msg;
        if (type in this.observers) {
            for (let obs of this.observers[type]) {
                obs(msg);
            } // for obs
        }
    } // notify
} // Observable
