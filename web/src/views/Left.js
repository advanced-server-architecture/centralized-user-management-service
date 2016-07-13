import React from 'react';
import {
    Menu
} from 'antd';
import {
    withRouter
} from 'react-router';

@withRouter
export default class Left extends React.Component {
    render() {
        const {
            location,
            router
        } = this.props;
        return <Menu
            onClick={e => router.push(e.key)}
            selectedKeys={[location]}>
            <Menu.Item
                key='user'>
                User
            </Menu.Item>
            <Menu.Item
                key='application'>
                Application
            </Menu.Item>
            <Menu.Item
                key='permission'>
                Permission
            </Menu.Item>
            <Menu.Item
                key='Role'>
                Role
            </Menu.Item>
        </Menu>;
    }
}
