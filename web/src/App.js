import React from 'react';
import ReactDom from 'react-dom';
import {
    Router,
    Route,
    hashHistory,
    withRouter
} from 'react-router';

import {
    Spin,
    LocaleProvider
} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

import Flex from 'components/Flex';

import NotFound from 'views/NotFound';
import Left from 'views/Left';
import Top from 'views/Top';
import User from 'views/User';
import Login from 'views/Login';

import GlobalStore from 'stores/GlobalStore';
import MiscStore from 'stores/MiscStore';
import * as Misc from 'actions/Misc';
import watch from 'watch';


@withRouter
@watch(GlobalStore, MiscStore)
class App extends React.Component {
    componentDidMount() {
        Misc.Status();
    }
    render() {
        const loading = GlobalStore.getState().get('loading');
        const store = MiscStore.getState();
        const {
            location,
            router
        } = this.props;

        if (!store.get('user') &&
            location.pathname !== '/login') {
            router.push('/login');
        }

        let content = <Flex
            style={{
                margin: 10,
                background: '#fff',
                borderRadius: 10
            }}
            direction='column'>
            <Flex>
                <Top/>
            </Flex>
            <Flex
                direction='row'>
                <Flex
                    style={{
                        borderRadius: ''
                    }}
                    width={140}>
                    <Left/>
                </Flex>
                <Flex
                    style={{
                        padding: 10
                    }}>
                    {this.props.content}
                </Flex>
            </Flex>
        </Flex>;
        if (location.pathname === '/login') {
            if (store.get('user')) {
                router.push('/');
            }
            content = this.props.content;
        } else {
            if (!store.get('user')) {
                router.push('/login');
            }
        }
        return (
            <Spin
                size='large'
                spinning={loading}>
                <LocaleProvider locale={enUS}>
                    {content}
                </LocaleProvider>
            </Spin>
        );
    }
}

ReactDom.render((
    <Router history={hashHistory}>
        <Route path='/' component={App}>
            <Route path='user' components={{content: User}}/>
            <Route path='login' components={{content: Login}}/>
            <Route path='*' components={{content: NotFound}}/>
        </Route>
    </Router>
), document.getElementById('container'));
