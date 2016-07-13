import http from 'http';

function Login(method, account, secret) {
    return http
        .post('/_admin/login')
        .send({
            method,
            account,
            secret
        });
}

function Status() {
    return http
        .get('/_admin/status');
}

function Logout() {
    return http
        .get('/_admin/logout');
}

export {
    Login,
    Status,
    Logout
};
