import React from 'react';
import ReactDom from 'react-dom';
import {
    Router,
    Route,
    hashHistory
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

import GlobalStore from 'stores/GlobalStore';
import watch from 'watch';


@watch(GlobalStore)
class App extends React.Component {
    render() {
        const loading = GlobalStore.getState().get('loading');
        return (
            <Spin
                size='large'
                spinning={loading}>
                <LocaleProvider locale={enUS}>
                    <Flex
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
                            <Left/>
                            <Flex
                                style={{
                                    padding: 10
                                }}>
                                {this.props.content}
                            </Flex>
                        </Flex>
                    </Flex>
                </LocaleProvider>
            </Spin>
        );
    }
}

ReactDom.render((
    <Router history={hashHistory}>
        <Route path='/' component={App}>
            <Route path='/user' components={{content: User}}/>
            <Route path='*' components={{content: NotFound}}/>
        </Route>
    </Router>
), document.getElementById('container'));
