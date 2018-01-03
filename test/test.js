const chai = require('chai');
const assert = chai.assert;
const crypt = require('../index.js');



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
                it('should encrypt: "' + test.message + '" with: "' + passphrase + '", expecting: "' + expectedEncryption, function () {
                    this.timeout(15 * 1000);

                    //console.log('Encrypting "' + test.message + '" with "' + passphrase + '", expecting "' + expectedEncryption + '"');

                    let encrypted = crypt.encrypt(test.message, passphrase, scryptOptions);
                    let decrypted = crypt.decrypt(encrypted, passphrase, scryptOptions);
                    //console.log('DBG: Encrypted trytes:', encrypted);

                    assert.isNotNull(encrypted, 'For ' + passphrase);
                    assert.strictEqual(encrypted, expectedEncryption, 'For ' + passphrase);

                    assert.isNotNull(decrypted, 'For ' + passphrase);
                    assert.strictEqual(decrypted, test.message, 'For ' + passphrase);
                });
            }
        }
    })

});


/**
 * Test same message and passphrase with different parallelization for Scrypt
 */
describe('Encrypt messages with parallelization 1 to 8', function () {

    const test =
        {
            message: 'HAGDCD9DBFFA',
            passphrase: 'hello',
            encrypted: ['NGAFJIDIWFUEFGODCE',
                'I9NCYBIFYAADLBM9GA',
                'CDMDIGGGPHND9ABBFD',
                'KG9DB9EFSA9HQFHFGC',
                'EAL9QBU9OGNDBERCXE',
                'UGVDRBDIQ99FAECGJB',
                'OEUGVDC9KEEEUGB9L9',
                '9ETGUFSAFHEH9CRFDB',
                'ACZEPBLDDHHBMCRFIB']
        };

    let message = test.message;
    let passphrase = test.passphrase;
    for (let i = 0; i < test.encrypted.length; i++) {
        let expectedEncryption = test.encrypted[i];
        let parallelization = i;
        let scryptOptions = { p: parallelization };


        it('should encrypt: "' + test.message + '" with parallelization ' + parallelization + ', expecting: "' + expectedEncryption + '"', function () {
            this.timeout(60 * 1000);

            // Time the encryption
            let start = Date.now();
            let encrypted = crypt.encrypt(test.message, passphrase, scryptOptions);
            let durationEncrypt = (Date.now() - start) / 1000;
            //console.log('DBG: Encrypted trytes:', encrypted);

            // Time the decryption
            start = Date.now();
            let decrypted = crypt.decrypt(encrypted, passphrase, scryptOptions);
            let durationDecrypt = (Date.now() - start) / 1000;
            //console.log('Parallelization',parallelization,'Encrypted in', durationEncrypt.toFixed(1),'sec, and decrypted in',durationDecrypt.toFixed(1),'sec');

            assert.isNotNull(encrypted, 'For ' + passphrase);
            assert.strictEqual(encrypted, expectedEncryption, 'For ' + passphrase);

            assert.isNotNull(decrypted, 'For ' + passphrase);
            assert.strictEqual(decrypted, test.message, 'For ' + passphrase);
        });
    }


});

