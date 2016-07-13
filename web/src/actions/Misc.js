import MiscStore from 'stores/MiscStore';

export const Login = (method, account, secret) =>
    MiscStore.dispatch({
        type: 'Login',
        method,
        account,
        secret
    });

export const Status = () =>
    MiscStore.dispatch({ type: 'Status' });

export const Logout = () =>
    MiscStore.dispatch({ type: 'Logout' });
