/**
 * 
 */
const scrypt = require('scrypt-async');
const aes = require('aes-js');
const sha256 = require('sha256');
const Trytes = require('trytes');

const scryptOptionsDefault =
    {
        logN: 14,           // The number of iterations (N = 2^14 = 16384)
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
    } else if (typeof scryptOptions === 'string') {
        scryptOptions = parseEncryptionSuffix(scryptOptions);
    } else {
        var encryptionSuffix = generateEncryptionSuffix(scryptOptions);
        scryptOptions = parseEncryptionSuffix(encryptionSuffix);  // Make sure 'toughness' is properly initialised
    }


    let seedBytes = Trytes.encodeTryteStringAsBytes(seed);
    createAESCryptor(passphrase, scryptOptions, function (cryptor) {
        let encryptedSeedBytes = cryptor.encrypt(seedBytes);

        let encryptedSeed = Trytes.encodeBytesAsTryteString(encryptedSeedBytes);
        if (encryptionSuffix)
            encryptedSeed += ':' + encryptionSuffix;
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
    let [seedOnly, suffix] = encryptedSeed.split(':');
    let suffixOptions = parseEncryptionSuffix(suffix);
    let options = Object.assign({}, scryptOptionsDefault, scryptOptions, suffixOptions);

    let encryptedSeedBytes = Trytes.decodeBytesFromTryteString(seedOnly);

    let cryptor = createAESCryptor(passphrase, options, function (cryptor) {

        let seedBytes = cryptor.decrypt(encryptedSeedBytes);
        let seed = Trytes.decodeTryteStringFromBytes(seedBytes);

        callback(seed);
    });
}

function parseEncryptionSuffix(encryptionSuffix) {
    let scryptOptions = {};
    let regexp = /(\w\d+)?(\w\d+)?(\w\d+)?(\w\d+)?/g;
    let match = regexp.exec(encryptionSuffix);
    for (let i = 1; i < match.length; i++) {
        if (typeof match[i] !== 'undefined') {
            if (match[i][0] == 'N')
                scryptOptions.logN = parseInt(match[i].substr(1));
            else if (match[i][0] == 'R')
                scryptOptions.r = parseInt(match[i].substr(1));
            else if (match[i][0] == 'P')
                scryptOptions.p = parseInt(match[i].substr(1));
            else if (match[i][0] == 'T') {
                var toughness = parseInt(match[i].substr(1));
                scryptOptions.logN = scryptOptionsDefault.logN + toughness;
                scryptOptions.r = scryptOptionsDefault.r + toughness;
                scryptOptions.p = scryptOptionsDefault.p + toughness;
            }
        }
    }
    return scryptOptions;
}

function generateEncryptionSuffix(scryptOptions) {
    let suffix = "";

    if (scryptOptions.logN && scryptOptions.r && scryptOptions.p
        && scryptOptions.logN - scryptOptionsDefault.logN == scryptOptions.r - scryptOptionsDefault.r
        && scryptOptions.logN - scryptOptionsDefault.logN == scryptOptions.p - scryptOptionsDefault.p) 
    {
        scryptOptions = {toughness: scryptOptions.p - scryptOptionsDefault.p};
    }

    if (scryptOptions.toughness)
        suffix += 'T' + scryptOptions.toughness;
    if (scryptOptions.logN && scryptOptions.logN != scryptOptionsDefault.logN)
        suffix += 'N' + scryptOptions.logN;
    if (scryptOptions.r && scryptOptions.r != scryptOptionsDefault.r)
        suffix += 'R' + scryptOptions.r;
    if (scryptOptions.p && scryptOptions.p != scryptOptionsDefault.p)
        suffix += 'P' + scryptOptions.p;

    return suffix;
}


function createAESCryptor(passphrase, scryptOptions, callback) {
    // Merge given scrypt options, overriding default ones
    scryptOptions = Object.assign({}, scryptOptionsDefault, scryptOptions);
    //passphrase = passphrase.trim();

    // Converts the unicode string to bytes, using the UTF-8 encoding
    let passphraseBytes = aes.utils.utf8.toBytes(passphrase);

    let hashedPassphrase = new Buffer(sha256.x2(passphraseBytes, { asBytes: true }));
    //console.log('Created hash "'+hashedPassphrase.toString('HEX').toUpperCase()+"");

    // Create encryption key (32 bytes)
    let numBytes = 32;
    scryptOptions = Object.assign(scryptOptions, { encoding: 'binary', dkLen: numBytes });
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