import React from 'react';
import {
    Input
} from 'antd';
import Flex from 'components/Flex';

const labelStyle = {
    width: 150,
    justifyContent: 'flex-end',
    fontSize: 14,
    marginRight: 10,
    flex: null
};

const itemStyle = {
    fontSize: 14,
};

import UserStore from 'stores/UserStore';
import watch from 'watch';

@watch(UserStore)
export default class App extends React.Component {
    state = {

    };
    render() {
        const store = UserStore.getState();

        return <Flex
            direction='column'>
            <Flex>
                <Flex style={labelStyle}>_id:</Flex>
                <Flex style={itemStyle}>
                    <Input
                        disabled
                        style={{
                            width: 200
                        }}
                        value={store.get('_id')}/>
                </Flex>
            </Flex>
        </Flex>;
    }
}
