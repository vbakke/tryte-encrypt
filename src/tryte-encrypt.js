/**
 * 
 */
const scrypt = require('scryptsy');
const aes = require('aes-js');
const sha256 = require('sha256');
const Trytes = require('trytes');

const scryptOptionsDefault = 
{
    N: Math.pow(2, 14), // The number of iterations (16384)
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
 */
function encrypt(seed, passphrase, scryptOptions) {
    let seedBytes = Trytes.encodeTryteStringAsBytes(seed);
    
    let cryptor = createAESCryptor(passphrase, scryptOptions);

    let encryptedSeedBytes = cryptor.encrypt(seedBytes);
    
    let encryptedSeed = Trytes.encodeBytesAsTryteString(encryptedSeedBytes);
    return encryptedSeed;
}

/**
 * Decrypt a tryte string, to its original tryte string.
 * 
 * Both passphrase and scryptOptions must be exaclty as en encrypting the tryte.
 * 
 * @param {*} encryptedSeed 
 * @param {*} passphrase 
 * @param {*} scryptOptions 
 */
function decrypt(encryptedSeed, passphrase, scryptOptions) {
    let encryptedSeedBytes = Trytes.decodeBytesFromTryteString(encryptedSeed);
    
    let cryptor = createAESCryptor(passphrase, scryptOptions);

    let seedBytes = cryptor.decrypt(encryptedSeedBytes);
    let seed = Trytes.decodeTryteStringFromBytes(seedBytes);
    
    return seed;
}


function createAESCryptor(passphrase, scryptOptions) {
    // Merge given scrypt options, overriding default ones
    scryptOptions = Object.assign({}, scryptOptionsDefault, scryptOptions);
    //passphrase = passphrase.trim();

    // Converts the unicode string to bytes, using the UTF-8 encoding
    let passphraseBytes = aes.utils.utf8.toBytes(passphrase);
    
    let hashedPassphrase = new Buffer(sha256.x2(passphraseBytes, {asBytes: true}));
    //console.log('Created hash "'+hashedPassphrase.toString('HEX').toUpperCase()+"");
    
    // Create encryption key (32 bytes)
    let numBytes = 32;
    let encryptionKey = scrypt(passphrase, hashedPassphrase, scryptOptions.N, scryptOptions.r, scryptOptions.p, numBytes);
    //console.log('Created key "'+encryptionKey.toString('hex').toUpperCase()+"");

    // Create 
    let cryptor = new aes.ModeOfOperation.ctr(encryptionKey); 
    return cryptor;
}



module.exports = 
{ 
    encrypt,
    decrypt,
}