import * as Global from 'actions/Global';
import {
    message
} from 'antd';

export default function asyncMiddleware(errorHandler = e => {
    Global.Loaded();
    message.error(e);
}, successHandler = data => {

}) {
    return store => next => action => {
        console.log(store)
        next(action);
        const state = store.getState();
        console.log(state)
        console.log(state instanceof Promise)
    };
}
