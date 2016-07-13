import createStore from 'createStore';

import {
    Map,
    fromJS
} from 'immutable';

import {
    message
} from 'antd';
import http from '../http';
import logger from '../logger';

const defaultState = Map({
    loading: 0
});

const GlobalStore = createStore(function(state = defaultState, action) {
    switch (action.type) {
        case 'Load':
            return state.set('loading', state.get('loading') + 1);
        case 'Loaded':
            return state.set('loading', state.get('loading') - 1);
        default:
            return state;
    }
});

export default GlobalStore;
