
function validateNumber(value, min, max){
    if(value == "")
        return 4;
    if(isNaN(value))
        return 3;
    var num = toNumber(value);
    if(num < min)
        return 2;
    else if(max < num)
        return 1;
    return 0;
}

function toNumber(value){
    return parseFloat(value);
}