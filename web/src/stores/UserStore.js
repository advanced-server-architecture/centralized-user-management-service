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
    _id: '577370ef3301f55e6ac5f404',
    permissions: [],
    roles: [],
    credentials: [],
    profiles: []
});

const MiscStore = createStore(function(state = defaultState, action) {
    switch (action.type) {
        default:
            return state;
    }
});

export default MiscStore;
