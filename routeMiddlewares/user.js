const requireAuthMiddleware = require('middleware/requireAuthMiddleware');
const permissionValidator = require('middleware/permissionValidator');
const requireSignature = require('middleware/requireSignature');

module.exports = [
    requireSignature(),
    requireAuthMiddleware(),
    permissionValidator(
        (user, params) => {
            return params._id === user._id
        }
    ),
];