import createStore from 'createStore';

import {
    fromJS
} from 'immutable';

import {
    message
} from 'antd';
import http from 'http';
import logger from 'logger';
import { Login, Status, Logout} from 'apis/misc';
import * as Global from 'actions/Global';

const defaultState = fromJS({
    user: null
});

const MiscStore = createStore(function(state = defaultState, action) {
    switch (action.type) {
        case 'Login':
            return new Promise((resolve, reject) => {
                Global.Load();
                Login(action.method,
                    action.account,
                    action.secret)
                    .then(result => {
                        Global.Loaded();
                        message.success('Login Success');
                        resolve(state.set('user',fromJS(result[0])));
                    })
                    .catch(e => {
                        Global.Loaded();
                        message.error(e.message);
                        reject();
                    })
            });
        case 'Status':
            return new Promise((resolve, reject) => {
                Global.Load();
                Status()
                    .then(result => {
                        Global.Loaded();
                        resolve(state.set('user', fromJS(result[0])));
                    })
                    .catch(e => {
                        console.error(e);
                        Global.Loaded();
                        message.error(e.message);
                        reject();
                    })
            });
        case 'Logout':
            return new Promise((resolve, reject) => {
                Global.Load();
                Logout()
                    .then(result => {
                        Global.Loaded();
                        resolve(state.set('user', null));
                    })
                    .catch(e => {
                        console.error(e);
                        Global.Loaded();
                        message.error(e.message);
                        reject();
                    })
            });
        default:
            return state;
    }
});

export default MiscStore;
