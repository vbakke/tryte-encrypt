const crypt = require('tryte-encrypt');

let seed = "A9TEST9SEED99RMDKUTQVGFMYPYGAQVOTGJCEFIEELKHRBCZYKAOQQWFRYNGYDAEIKTHQJINZDPYNYOS9";
let passphrase = "Ƥāssφräsę"

let encrypted = crypt.encrypt(seed, passphrase, scryptOptions);
let decrypted = crypt.decrypt(encrypted, passphrase, scryptOptions);
