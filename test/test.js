const chai = require('chai');
const assert = chai.assert;
const crypt = require('../index.js');



/**
 * Test default scryptOptions
 */
describe('Encrypt using default scrypt options', function () {
    const test =  {
        message: 'A999TEST999SEED99999999999999999999999999999999999999999999999999999999999999999Z',
        passphrase: 'Passφräsę',
        encrypted: 'ZAC9UAOGGGNCTHPFPABGRHKARFDIBBFGMHGCTENBDCQFCBTELDREFFJAXGDGTGPDFFIBCFXCEHKFJAICNBDGEIQGCHAFGGZDDAUH'
    };

    it('should encrypt: "' + test.message + '" with: "' + test.passphrase + '"', function (done) {
        crypt.encrypt(test.message, test.passphrase, function (encrypted) {
            assert.isNotNull(encrypted, 'For ' + test.passphrase);
            assert.strictEqual(encrypted, test.encrypted, 'For ' + test.passphrase);

            crypt.decrypt(encrypted, test.passphrase, function (decrypted)  {

                //console.log('DBG: Encrypted trytes:', encrypted);
                
                
                assert.isNotNull(decrypted, 'For ' + test.passphrase);
                assert.strictEqual(decrypted, test.message, 'For ' + test.passphrase);

                done();
            });
        });
    });
});

/**
 * Test differnt passphrases on the same message.
 * 
 * Turn parallelization down to 1, for faster testing.
 */
describe('Encrypt messages with parallelization = 1', function () {
    let parallelization = 1;
    let scryptOptions = { p: parallelization };

    const tests = [
        {
            message: '9999',
            passphrase: 'hello',
            encrypted: 'OACBBCJC'
        },
        {
            message: 'ZZ',
            passphrase: 'hello',
            encrypted: '9HEBDF'
        },
        {
            message: 'ZZZ',
            passphrase: 'hello',
            encrypted: '9HXCEF'
        },
        {
            message: 'ZZZZ',
            passphrase: 'hello',
            encrypted: '9HNGJCJC'
        },
        {
            message: 'ZZZZZ',
            passphrase: 'hello',
            encrypted: '9HNGZE'
        },
        {
            message: 'ZZZZZZ',
            passphrase: 'hello',
            encrypted: '9HNGZESFBD'
        },
        {
            message: 'HAGDCD9DBFFA',
            passphrase: ['hello', ' hello ', 'Hæl lø'],
            encrypted: ['I9NCYBIFYAADLBM9GA', 'TBXGWGPE9GEBR9DCUF', 'IBRCMCZF9GKFLCJAL9']
        },
        {
            message: 'KB99YZZZ',
            passphrase: ['hello', 'Æ lönger Ƥāssφräsę'],
            encrypted: ['ZCCBPFLCMGMF', 'TBLDJHBFNBMA'],
        },
        {
            message: 'A9TEST9SEED99RMDKUTQVGFMYPYGAQVOTGJCEFIEELKHRBCZYKAOQQWFRYNGYDAEIKTHQJINZDPYNYOS9',
            passphrase: ['hello', 'snow \u2603\u{1F332}\u96EA \u0421\u043d\u0435\u0433 \u0e2b\u0e34\u0e30 \u0baa\u0ba9\u0bbf\u0ba4\u0bcd\u0ba4\u0bc2\u0bb5\u0bbf'],
            encrypted: ['PAOHLIYFKBIDVCM9JFSDJCYCCBFGRHKAL9UAABKCB9HCMHZAPBJCYCTGFEOEKGJHJDBHXFSHGCLEJIHBPDDBIFE9FCWAXHYDDHMH', 'FGKGFHZFWAAHXGYGTHC9ZGAHCDU9GGK9JAMACIXFMFBHBH9HNEXGC99GNHKH9ECF9E9CZ9VHGGGHPEXGDBL9NFOAS9YEPGJHCBSD']
        },
        {
            message: 'A9TEST9ADDRESS99BTFKEHPQNGELDPWJSZCLRKU9EAIMDLNCOAIEI9JISIPWTSFUWIUCFWYXNUEPVAESHEQPKIHHNB',
            passphrase: 'hello',
            encrypted: 'PAOHLIYFQGRDGI9ETGGDYDIEABFDEETCQ9BB9GN9QDGHWGB9UA9INHQ9X99IHITAEIEIEBPDZHGAMDJANGRFTDBEZHVH9AREBCNEIBSFX9KB'
        },
        {
            message: 'A999TEST999SEED99999999999999999999999999999999999999999999999999999999999999999Z',
            passphrase: 'Ƥāssφräsę',
            encrypted: 'EFVCIHFGBA9IGCUEN9LHAI9G9FDDI9MBS9IFWBHBJHBGQAEEV9IEJHWG9HSEKEUCDAIDQFICHFBGADZFZDVFUAPAGGXCLECFNEME'
        },

    ];


    tests.forEach(function (test) {
        if (test.hasOwnProperty('message') && test.hasOwnProperty('passphrase') && test.hasOwnProperty('encrypted')) {

            let passphrases = test.passphrase;
            let expectedEncryptions = test.encrypted;
            if (typeof passphrases === 'string') passphrases = [passphrases];
            if (typeof expectedEncryptions === 'string') expectedEncryptions = [expectedEncryptions];


            // Make sure that the testes match in length
            if (passphrases.length != expectedEncryptions.length)
                throw new Error('Length mismatch for passphrase and encrypted for ' + test.message);

            for (let i = 0; i < passphrases.length; i++) {
                let passphrase = passphrases[i];
                let expectedEncryption = expectedEncryptions[i];
                const local_i = i;
                it('should encrypt: "' + test.message + '" with: "' + passphrase + '"', function () {
                    this.timeout(15 * 1000);

                    //console.log('DBG: Encrypting "' + test.message + '" with "' + passphrase + '"');

                    crypt.encrypt(test.message, passphrase, scryptOptions, function (encrypted) {
                        assert.isNotNull(encrypted, 'For ' + passphrase);
                        assert.strictEqual(encrypted.split(':')[0], expectedEncryption, 'For ' + passphrase);

                        crypt.decrypt(encrypted, passphrase, scryptOptions, function (decrypted) {

                            //console.log('DBG: Encrypted trytes:', encrypted);
                            
                            
                            assert.isNotNull(decrypted, 'For ' + passphrase);
                            assert.strictEqual(decrypted, test.message, 'For ' + passphrase);
                            if (local_i == passphrases.length)
                                done();
                        });
                    });
                });
            }
        }
    })

});
// */

/**
 * Test same message and passphrase with different parallelization for Scrypt
 */
describe('Encrypt messages with increasing parallelization', function () {

    const test =
        {
            message: 'HAGDCD9DBFFA',
            passphrase: 'hello',
            encrypted: [//'NGAFJIDIWFUEFGODCE',
                'I9NCYBIFYAADLBM9GA',
                'CDMDIGGGPHND9ABBFD',
                'KG9DB9EFSA9HQFHFGC',
                'EAL9QBU9OGNDBERCXE',
                'UGVDRBDIQ99FAECGJB',
                'OEUGVDC9KEEEUGB9L9',
                '9ETGUFSAFHEH9CRFDB',
                'ACZEPBLDDHHBMCRFIB',
                'NDQDOCGECFKCMGEDBH',
                'EHCCCCR9EGDAHBKHJB',
                'SABBRAMDX9ODEGXFDG',
                'EFIGYFECMCJ9TEUEJG',
                ]
        };

    let message = test.message;
    let passphrase = test.passphrase;
    for (let i = 0; i < test.encrypted.length; i++) {
        const local_i = i;
        let expectedEncryption = test.encrypted[i];
        let parallelization = i+1;
        let scryptOptions = { p: parallelization };


        it('should encrypt: "' + test.message + '" with parallelization ' + parallelization, function () {
            this.timeout(60 * 1000);

            testEncryptDecrypt(message, passphrase, scryptOptions, test.encrypted[local_i], function () {
                if (local_i == test.encrypted.length)
                    done();
            });
        });
    }
});
// */

/**
 * Test same message and passphrase with different iterations for Scrypt
 */
describe('Encrypt messages with increasing iterations', function () {

    const test =
        {
            message: 'HAGDCD9DBFFA',
            passphrase: 'hello',
            encrypted: [
                'DGZBEGYFVBFEUBKAK9',
                'FA9CRHVCXGXFNGYGGA',
                'ACZEPBLDDHHBMCRFIB',
                'TEI9G9RERALBSCUDPG',
                'QGFHTFPGQAHHMGVENB',
                'GCJDAGOFRG9HBBSGVF',
                'JIEBSDVDLBCACCPDUH',
            ]
        };

    let message = test.message;
    let passphrase = test.passphrase;
    for (let i = 0; i < test.encrypted.length; i++) {
        const local_i = i;
        let expectedEncryption = test.encrypted[i];
        let logN = i + 12;
        let scryptOptions = { logN };


        it('should encrypt: "' + test.message + '" with logN:' + logN + '', function () {
            this.timeout(60 * 1000);

            testEncryptDecrypt(message, passphrase, scryptOptions, test.encrypted[local_i], function () {
                if (local_i == test.encrypted.length)
                    done();
            });
        });
    }

});
// */

/**
 * Test same message and passphrase with different iterations for Scrypt
 */
describe('Encrypt messages with increasing toughness', function () {

    const test =
        {
            message: 'A999TEST999SEED99999999999999999999999999999999999999999999999999999999999999999Z',
            passphrase: 'Ƥāssφräsę',
            encrypted: [
                'VHTEIGE9LGC9XCQBAF9EAHIF99JADIKBQ99DDGWBTACDRDGA9HMFOCPEPFDCECJCUAXHMHR9WBTHPGLHHFQFSDOBHFGAVCICXBRD',
                'FIGAV9XDJFPDCHHDUHFBSDXBJEQAP9QBBGVCOBX9PDGGHFRDQAQ9VAUHNHODWDVHMARCZGE9WFCGN9AIJEZCIDCGY9BENEQEACGC',
                'TFTCYFMFI9QDMHTADEJBAFCCHBCDAGFHWEVGVBBGDDODO9FBSEL9AG9EQEIG9EWGM9RFT99FH9XCO9KGZFO9GHFHVACARAFIEIXA',
                'WBD9KIIGKFQDFCEGKBOCEBLAHDLAFHLDCHJEYHAGYB9GZBJDQHM9RAY9PDFCUHPELFNCABV9YDVAYBA9UEPBJBGBQHBDHAYCYCRA',
                'EIVHFDZCZBXFUGEGTALBEGHII9MHPFOHTBUFICB9I9PFTGS9YGYGIAPCCCDAYEN9CARGTHCHNHSFMDX9D9GEQDIGIARELIRDHGUH',
            ]
        };

    let message = test.message;
    let passphrase = test.passphrase;
    for (let i = 0; i < test.encrypted.length; i++) {
        const local_i = i;
        let expectedEncryption = test.encrypted[i];
        let logN = i + 14;
        let p = i + 8;
        let r = i + 8;
        let scryptOptions = { logN, p, r };


        it('should encrypt: "' + test.message + '" with logN:' + logN + ',p:' + p + ',r:' + r + ', expecting: "' + expectedEncryption + '"', function () {
            this.timeout(60 * 1000);

            testEncryptDecrypt(message, passphrase, scryptOptions, test.encrypted[local_i], function () {
                if (local_i == test.encrypted.length)
                    done();
            });
        });
    }

});





/**
 * Test function for encrypting, and then decrypting back to original message
 * 
 * @param {*} message 
 * @param {*} passphrase 
 * @param {*} scryptOptions 
 * @param {*} expected 
 * @param {*} callback 
 */
function testEncryptDecrypt(message, passphrase, scryptOptions, expected, callback) {
    // Time the encryption
    let start = Date.now();
    crypt.encrypt(message, passphrase, scryptOptions, function (encrypted) {

        let durationEncrypt = (Date.now() - start) / 1000;
        //console.log('DBG: Encrypted trytes:', encrypted);
        assert.isNotNull(encrypted, 'For ' + passphrase);
        assert.strictEqual(encrypted.split(':')[0], expected, 'For ' + passphrase);


        // Time the decryption
        start = Date.now();
        let decrypted = crypt.decrypt(encrypted, passphrase, scryptOptions, function (decrypted) {

            let durationDecrypt = (Date.now() - start) / 1000;
            //console.log('DBG: Encrypted in', durationEncrypt.toFixed(1),'sec, and decrypted in',durationDecrypt.toFixed(1),'sec');

            assert.isNotNull(decrypted, 'For ' + passphrase);
            assert.strictEqual(decrypted, message, 'For ' + passphrase);
            callback();
        });
    });
}
