import {
    nonenumerable,
    nonconfigurable
} from 'core-decorators';
class Store {
    @nonconfigurable
    @nonenumerable
    __listeners = [];
    @nonconfigurable
    @nonenumerable
    __reducer = null;
    @nonconfigurable
    @nonenumerable
    __state = undefined;
    constructor(reducer) {
        this.__reducer = reducer;
    }
    subscribe(listener) {
        const index = this.__listeners.push(listener) - 1;
        return () => {
            this.__listeners.splice(index, 1);
        }
    }
    __notify(action) {
        for (const listener of this.__listeners) {
            listener(action, this.__state);
        }
    }
    dispatch(action) {
        const state = this.__reducer(this.__state, action);
        if (state instanceof Promise) {
            state
                .then(data => {
                    this.__state = data;
                    this.__notify(action);
                })
                .catch(e => {
                    if (e) {
                        console.error(e.stack)
                    }
                });
        } else {
            this.__state = state;
            this.__notify(action);

        }
    }
    getState() {
        return this.__state;
    }
}

export default function createStore(reducer) {
    const store = new Store(reducer);
    store.dispatch('$INIT$');
    return store;
}
