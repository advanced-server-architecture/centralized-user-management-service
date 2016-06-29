import React from 'react';
import {
    Menu
} from 'antd';

export default class Left extends React.Component {
    render() {
        return <Menu
            defaultOpenKeys={['user', 'application', 'permission', 'role']}>
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
