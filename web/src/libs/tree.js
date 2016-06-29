
export const Flatten = (tree, index = 0) => {
    let result = [];
    let currNode = {
        name: tree.name,
        valueType: tree.valueType,
        children: []
    };
    if (currNode.valueType !== 'object' ||
        currNode.valueType !== 'array') {
        currNode.value = tree.value
    }
    result.push(currNode);
    index++;
    for (const child of tree.children || []) {
        currNode.children.push(index);
        const flatChild = Flatten(child, index);
        result = result.concat(flatChild);
        index += flatChild.length;
    }
    return result;
};

export const Unflatten = (list, index = 0) => {
    let node = {};
    if (!list[index]) {
        return {};
    }
    node.name = list[index].name;
    node.valueType = list[index].valueType;
    if (node.valueType !== 'object' ||
        node.valueType !== 'array') {
        node.value = list[index].value;
    }
    node.index = index;
    node.children = [];
    for (const childIndex of (list[index].children || []))  {
        node.children.push(Unflatten(list, childIndex));
    }
    return node;
};

const _toJson = (tree) => {
    switch (tree.valueType) {
        case 'object': {
            let result = {};
            for (const child of tree.children) {
                result[child.name] = _toJson(child);
            }
            return result;
        }
        case 'array': {
            let result = [];
            for (const child of tree.children) {
                result.push(_toJson(child));
            }
            return result;
        }
        default:
            return tree.value;
    }
}

export const toJson = (list) => {
    const tree = Unflatten(list);
    return _toJson(tree);
}