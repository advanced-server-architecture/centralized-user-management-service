import React, {
    Component
} from 'react';

import _ from 'lodash'

export default class extends Component {
    render() {
        let style = {
            display: 'flex'
        };
        if (this.props.display) {
            style.display = this.props.display;
        }
        if (this.props.width && this.props.direction !== 'column') {
            style.width = this.props.width;
        } else if (this.props.height) {
            style.height = this.props.height;
        } else if (this.props.flex) {
            style.flex = this.props.flex;
        } else {
            style.flex = 1;
        }
        if (this.props.direction) {
            style.flexDirection = this.props.direction;
        }
        if (this.props.align) {
            style.alignItems = this.props.align;
        }
        if (this.props.self) {
            style.alignSelf = this.props.self;
        }
        if (this.props.justify) {
            style.justifyContent = this.props.justify;
        }
        if (this.props.margin) {
            style.margin = this.props.margin;
        }
        if (this.props.padding) {
            style.padding = this.props.padding;
        }
        if (this.props.style) {
            style = _.extend(style, this.props.style);
        }
        return <div style={style}>{this.props.children}</div>;
    }
}