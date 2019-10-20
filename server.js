require('dotenv').config({ path: 'secrets/sandbox.env' })
const https = require('https');
const uuid = require('uuid');
const fs = require('fs');

const requestID = uuid.v4();
var today = new Date();
today.setDate(today.getDate() + 10);
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
}

if (mm < 10) {
    mm = '0' + mm;
}
const consentValidUntil = yyyy + '-' + mm + '-' + dd;


const data = JSON.stringify({
    "access": {
        "balances": [{
            "iban": process.env.PT_IBAN
        }
        ],
        "transactions": [{
            "iban": process.env.PT_IBAN
        }
        ]
    },
    "recurringIndicator": true,
    "validUntil": consentValidUntil,
    "frequencyPerDay": 4,
    "combinedServiceIndicator": false
});

const options = {
    hostname: process.env.PT_HOST,
    port: process.env.PT_PORT,
    path: `${process.env.PT_PATH}/${process.env.PT_VERS}/consents`,
    method: 'POST',
    key: fs.readFileSync('secrets/cert/own/priv.key'),
    cert: fs.readFileSync('secrets/cert/own/zertifikat_pem.crt'),
    requestCert: true,
    rejectUnauthorized: false,
    headers: {
        'Content-Type': 'application/json',
        'TPP-Redirect-Preferred': true,
        'TPP-Redirect-URI': process.env.PT_TPPREDIRECTURI,
        'X-Request_ID': requestID
    }
}

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        process.stdout.write(d)
    })
})

req.on('error', error => {
    console.error(error)
})

req.write(data)
req.end()