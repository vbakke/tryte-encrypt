# tryte-encrypt
Encrypting tryte strings, such as IOTA seeds.

## Installation

`npm install tryte-encrypt`

## Version 2.0
The version 2.0 release is now using the asynchronous scrypt package [scrypt-async](https://www.npmjs.com/package/scrypt-async) instead of the former [scryptsy](https://www.npmjs.com/package/scryptsy).

The tyre-encrypt algorithm has not changed, and it produces the same encryption, and decryption as v1.x.

But the library is now using a callback function, and is not backwards compatibel with synchronous v1.x.

## Usage
```javascript
const crypt = require("./src/tryte-encrypt.js");

let seed = "A9TEST";
let passphrase = "hello"

crypt.encrypt(seed, passphrase, function (encrypted) {
    console.log('Encrypted '+seed+' to '+encrypted);
});

crypt.decrypt(encryptedSeed, passphrase, function (decrypted) {
    console.log('Decrypted '+encryptedSeed+' back to '+decrypted);
});
```
## Example
```javascript
const crypt = require("./src/tryte-encrypt.js");

let seed = "A9TEST9SEED99RMDKUTQVGFMYPYGAQVOTGJCEFIEELKHRBCZYKAOQQWFRYNGYDAEIKTHQJINZDPYNYOS9";
let passphrase = "Ƥāssφräsę"
console.log('Encrypting:', seed);

crypt.encrypt(seed, passphrase, function (encrypted) {
    console.log('Encrypted:', encrypted, 'using', passphrase);

    console.log('Decrypting...');
    crypt.decrypt(encrypted, passphrase, function (decrypted) {
        if (seed === decrypted) {
            console.log('Decrypted it back to original seed!');
        } else {
            console.log('Decryption failed to get the original seed!');
        }
    });
});

```

## Tuning
By default, the passphrase is hashed using Scrypt with the same arguments as BIP38 
```javascript
const scryptOptionsDefault = 
{
    logN: 14,           // The number of iterations (2^14 = 16384)
    r: 8,               // Memory factor
    p: 8                // Parallelization factor
};
```

You may override these, either all or some, as long as you make sure to use the same options when decrypting:
```javascript
crypt.encrypt(seed, passphrase, {logN: 15}, function (encrypted) {...} );
crypt.encrypt(seed, passphrase, {r: 16, p: 2}, function (encrypted) {...} );
crypt.encrypt(seed, passphrase, {p: 2}, function (encrypted) {...} );
crypt.decrypt(encrypted, passphrase, {p: 2}, function (decrypted) {...} );
```


## Algorithm
The encryption algorithm is based around the [BIP38](https://github.com/bitcoin/bips/blob/master/bip-0038.mediawiki)standard for BitCoin. 

Complexity is also a security risk. I've tried to simplyfy the BIP38 algorithm without loosing the security.

This is currently a draft, so feel free to discusse the matter in the [issues](https://github.com/vbakke/tryte-encrypt/issues).

### Encryption
The encryption is using AES, SHA256 and Scrypt.

1. The passphrase may be any unicode string, and is encoded to bytes using the UTF-8 encoding.
2. This byte array is double hashed with SHA256
3. Scrypt takes the original passphrase, and the hashed version to create 256 bit encryption key
4. The byte encoded version of the seed, is encrypted with AES, using the CTR mode.

### Tryte <-> byte conversion
AES deals only with bytes, not trytes.

Tryte and bytes have different ranges, and one cannot blindly convert from one to the other.

1. The original seed is a text string with tryte3 characters (9 + A-Z).
2. The seed is encoded as bytes using [vbakke/trytes](https://github.com/vbakke/trytes).\
(Actually, it is encoded as tryte5 (0-242), which fits inside a byte.)
3. The bytes (tryte5) are encrypted, as above.
4. The encrypted bytes are true bytes using the full range (0-255).
5. The bytes are encoded as tryte6 (0-728), and converted to a tryte string (9 + A-Z).

A seed of 81 tryte3 characters, end up with a string of 100 tryte3 characters.\
(Or fifty tryte6 characters, depending of which way you want to look at it.)




