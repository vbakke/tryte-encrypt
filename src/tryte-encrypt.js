/**
 * 
 */
const scrypt = require('scrypt-async');
const aes = require('aes-js');
const sha256 = require('sha256');
const Trytes = require('trytes');

const scryptOptionsDefault = 
{
    logN: 14,           // The number of iterations (2^14 = 16384)
    r: 8,               // Memory factor
    p: 8                // Parallelization factor
};



/**
 * Encrypt a tryte string (IOTA seed).
 * 
 * The function encypts using AES, and the passphrase comes from scrypt, basedon the SHA256 hash of the passphrase.
 * 
 * @param {*} seed A tryte string representing the IOTA seed
 * @param {*} passphrase A unicode text string
 * @param {*} scryptOptions Optional scrypt tuning, e.g. `{p: 4}`
 * @param {*} callback `function (encrypted)` 
 */
function encrypt(seed, passphrase, scryptOptions, callback) {
    if (typeof scryptOptions === 'function') {
        callback = scryptOptions;
        scryptOptions = {};
    }

    let seedBytes = Trytes.encodeTryteStringAsBytes(seed);
    
    createAESCryptor(passphrase, scryptOptions, function (cryptor) {
        let encryptedSeedBytes = cryptor.encrypt(seedBytes);

        let encryptedSeed = Trytes.encodeBytesAsTryteString(encryptedSeedBytes);
        callback(encryptedSeed);
    });

    
}

/**
 * Decrypt a tryte string, to its original tryte string.
 * 
 * Both passphrase and scryptOptions must be exaclty as en encrypting the tryte.
 * 
 * @param {*} encryptedSeed 
 * @param {*} passphrase 
 * @param {*} scryptOptions 
 * @param {*} callback `function (decrypted)` 
 */
function decrypt(encryptedSeed, passphrase, scryptOptions, callback) {
    if (typeof scryptOptions === 'function') {
        callback = scryptOptions;
        scryptOptions = {};
    }

    let encryptedSeedBytes = Trytes.decodeBytesFromTryteString(encryptedSeed);
    
    let cryptor = createAESCryptor(passphrase, scryptOptions, function (cryptor) {
        
        let seedBytes = cryptor.decrypt(encryptedSeedBytes);
        let seed = Trytes.decodeTryteStringFromBytes(seedBytes);
        
        callback(seed);
    });
}


function createAESCryptor(passphrase, scryptOptions, callback) {
    // Merge given scrypt options, overriding default ones
    scryptOptions = Object.assign({}, scryptOptionsDefault, scryptOptions);
    //passphrase = passphrase.trim();
    
    // Converts the unicode string to bytes, using the UTF-8 encoding
    let passphraseBytes = aes.utils.utf8.toBytes(passphrase);
    
    let hashedPassphrase = new Buffer(sha256.x2(passphraseBytes, {asBytes: true}));
    //console.log('Created hash "'+hashedPassphrase.toString('HEX').toUpperCase()+"");
    
    // Create encryption key (32 bytes)
    let numBytes = 32;
    scryptOptions = Object.assign(scryptOptions, {encoding: 'binary', dkLen: numBytes}); 
    let encryptionKey = scrypt(passphrase, hashedPassphrase, scryptOptions, function (encryptionKey) {
        let cryptor = new aes.ModeOfOperation.ctr(encryptionKey); 
        //console.log('Created key "'+encryptionKey.toString('hex').toUpperCase()+"");

        callback(cryptor);
    });  
}



module.exports = 
{ 
    encrypt,
    decrypt,
}