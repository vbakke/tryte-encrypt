const crypt = require('tryte-encrypt');

let seed = "A9TEST9SEED99RMDKUTQVGFMYPYGAQVOTGJCEFIEELKHRBCZYKAOQQWFRYNGYDAEIKTHQJINZDPYNYOS9";
let passphrase = "Ƥāssφräsę"
let start, duration;
let scryptOptions = {p: 4};


console.log('Encrypting:', seed);
start = Date.now();
let encrypted = crypt.encrypt(seed, passphrase, scryptOptions);
duration = (Date.now() - start)/1000;
console.log('Encrypted:', encrypted, 'using', passphrase, 'in', duration.toFixed(1), 'sec');



console.log('Decrypting...');
start = Date.now();
let decrypted = crypt.decrypt(encrypted, passphrase, scryptOptions);
duration = (Date.now() - start)/1000;
console.log('Original seed:', seed);
console.log('Decypted seed:', decrypted, 'in', duration.toFixed(1), 'sec');



// Verify the decrypted string
if (seed === decrypted)
    console.log('SUCCESS: Decryption matched original');
else
    console.log('FAILED: Decryption is different from original');

