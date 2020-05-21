const add = (a, b) => {
    if(!isNaN(a) && !isNaN(b)) return a + b;
    return NaN;
}

module.exports = { add };