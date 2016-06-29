'use strict';
const Exception = require('util/exception');
const _ = require('lodash');

function* singleValidator(condition, context) {
    const {user, params, query, scope} = context;
    const body = context.request.body;
    const conditionType = condition.constructor.name;
    if (conditionType === 'GeneratorFunction') {
        return yield condition(user, params, query, body);
    } else if (conditionType === 'Function') {
        return condition(user, params, query, body);
    } else if (conditionType === 'String') {
        //const [scopeName, permissionName] = condition.split('#');

        return !!(_.find(user.permissions, {
            scopeId: user.scope.scopeId,
            //scopeName,
            //name: permissionName
            name: condition
        }) || _.find(user.permissions, {
            scope: 'global',
            //name: permissionName || scopeName
            name: condition
        }));
    }
    return false;
}

function* validatorRunner(condition, context) {
    const {$operator, $items} = condition;
    if (!$operator) return yield singleValidator(condition, context);
    if ($operator === 'and') {
        for (const c of $items) {
            if (!(yield validatorRunner(c, context))) {
                return false;
            }
        }
        return true;
    } else if ($operator === 'if') {
        if (yield validatorRunner($items[0], context)) {
            return yield validatorRunner($items[1], context)
        } else {
            if ($items[2]) {
                return yield validatorRunner($items[2], context)
            } else {
                return true;
            }
        }
    } else if ($operator === 'or') {
        for (const c of $items) {
            if (yield validatorRunner(c, context)) {
                return true;
            }
        }
        return false;
    } 
    return false;
}

module.exports = Validator;

function Validator(condition) {

    return function* (next) {
        this.user = this.user || {
            permissions: [],
            roles: [],
            scope: {}
        };

        const type = Validator.$operator;
        let flag = true; 

        if (!(yield validatorRunner(condition, this))) {
            throw new Exception(403);
        }
        yield next;
    };
};

Validator.AND = (...conditions) => {
    return {
        $operator: 'and',
        $items: conditions
    };
};

Validator.OR = (...conditions) => {
    return {
        $operator: 'or',
        $items: conditions
    };
};

Validator.IF = (...conditions) => {
    return {
        $operator: 'if',
        $items: conditions
    };
};