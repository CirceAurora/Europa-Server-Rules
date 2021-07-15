const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ];

module.exports.encode = function encode(number) {
    let result = '';

    while (number > 0) {
        result = digits[number % 36] + result;
        number = Math.floor(number / 36);
    }

    return result || '0';
};
