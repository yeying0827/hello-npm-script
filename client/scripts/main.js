const add = (a, b) => {
    if(isNaN(a) || isNaN(b)) return 'NaN';
    return a + b;
};

add(1, 3);