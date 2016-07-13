import React from 'react';
import {
    withRouter
} from 'react-router';
import {
    Input,
    Button,
    Icon,
    Select,
    message
} from 'antd';
import Flex from 'components/Flex';
import * as Misc from 'actions/Misc';
import MiscStore from 'stores/MiscStore';
import watch from 'watch';

@withRouter
@watch(MiscStore)
export default class Login extends React.Component {
    state = {
        account: 'admin',
        secret: 'admin',
        method: 'username'
    };
    render() {
        const state = this.state;
        const store = MiscStore.getState();
        if (store.get('user')) {
            this.props.router.push('/user');
        }
        return <Flex
            align='center'
            direction='column'>
            <Flex
                padding='50px 0 20px 0'>
                <h1> User Management </h1>
            </Flex>
            <Flex>
                <Flex
                    style={{
                        background: '#d9d9d9',
                        padding: '20px 40px 20px 40px',
                        borderRadius: 10,
                    }}
                    align='center'
                    direction='column'>
                    <div
                        style={{
                            width: 280,
                            marginBottom: 10
                        }}>
                        <Input
                            size='large'
                            value={state.account}
                            onChange={e => {
                                const account = e.target.value;
                                if (state.method === 'phone') {
                                    if (!(/^[0-9]*$/.test(account))) {
                                        return;
                                    }
                                }
                                this.setState({account});
                            }}
                            addonAfter={<Select
                                style={{
                                    width: 90
                                }}
                                value={state.method}
                                onChange={method => {
                                    this.setState({
                                        account: '',
                                        method
                                    });
                                }}>
                                <Select.Option value='username'>username</Select.Option>
                                <Select.Option value='phone'>phone</Select.Option>
                            </Select>}
                            placeholder={state.method}/>
                    </div>
                    <Input
                        type='password'
                        value={state.secret}
                        onChange={e => {
                            this.setState({secret: e.target.value});
                        }}
                        style={{
                            marginBottom: 10,
                            width: 190
                        }}
                        placeholder='password'/>
                    <Button
                        onClick={e => {
                            if (state.account === '' ||
                                state.secret === '') {
                                message.error('Please enter username/phone and password');
                                return;
                            }
                            Misc.Login(
                                state.method,
                                state.account,
                                state.secret
                            );
                        }}
                        style={{
                            width: 120
                        }}> Login </Button>
                </Flex>
            </Flex>
        </Flex>
    }
}
