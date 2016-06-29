export default function(formName) {
    return Component => class extends Component {
        setForm(key) {
            return e => {
                let form = this.state[formName];
                let value = e;

                if (e.target) {
                    if (e.target.value !== undefined) {
                        value = e.target.value;
                    } else if (e.target.checked) {
                        value = !!e.target.checked;
                    }
                }

                form[key] = value;
                let state = {};
                this.setState({
                    [formName]: form
                });
            }
        }
    }
}