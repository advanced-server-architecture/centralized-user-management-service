export default function(...stores) {
    return Component => class extends Component {
        constructor(props) {
            super(props);
            this.state = this.state || {};
            this.state.__t = 0;
        }
        componentDidMount(...params) {
            this.__dispose = this.__dispose || [];
            for (const Store of stores) {
                this.__dispose.push(Store.subscribe((action, state) => {
                    if (!Store.getState()) {
                        return;
                    }
                    this.setState({__t: this.__t + 1});
                    if (super.didReceiveState) {
                        super.didReceiveState(Store, Store.getState());
                    }
                }));
            }
            if (super.componentDidMount) {
                super.componentDidMount(...params);
            }
        }
        componentWillUnmount(...params) {
            for (const dispose of this.__dispose) {
                dispose();
            }
            if (super.componentWillUnmount) {
                super.componentWillUnmount(...params);
            }
        }
    }
}
