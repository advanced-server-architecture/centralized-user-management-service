import { notification } from 'antd';

export const success = (description) => {
    notification.success({
        message: 'Success',
        description,
        duration: 2.5
    });
}

export const error = (description) => {
    notification.error({
        message: 'Error',
        description,
        duration: 2.5
    });
}
