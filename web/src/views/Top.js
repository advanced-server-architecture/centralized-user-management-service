import React from 'react';
import {
    Button
} from 'antd';
import Flex from 'components/Flex';
import * as Misc from 'actions/Misc';

export default class Top extends React.Component {
    render() {
        return <div>
            <Button
                onClick={e => Misc.Logout()}>Logout</Button>
        </div>;
    }
}
