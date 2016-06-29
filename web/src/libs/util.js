export const parseNumber = (str) => {
    if (str.indexOf('.') === str.length -1)  {
        return str;
    }
    if (str.indexOf('.') !== -1) {
        return parseFloat(str);
    }
    return parseInt(str);
}