const { Builder, By, Key, until, Capabilities } = require('selenium-webdriver');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

var item_list = [];
/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1zKkiSNGBUr6q8DpnkOIS-DxvjRICD6E1jSYA0LXZxf8',
        range: 'Sheet3!A2:G200',
    }, (err, res) => {


        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            // console.log(rows);
            for (const row of rows) {
                if (row.length > 4 && row[4].length > 0 && parseInt(row[3]) > 0) {
                    // has a link and has a quantity
                    item_list.push({
                        name: row[1],
                        link: row[4],
                        quantity: parseInt(row[3])
                    });
                }
            }
            console.log(item_list.map(i => { return { name: i.name, quantity: i.quantity } }))
            console.log("Total: " + item_list.length);
            rl.question("Correct? ", function (answer) {
                rl.close();
                if (answer == 'y' || answer.length == 0) {
                    selenium_automation();
                } else {
                    console.log("Cancelled");
                }
            });
        } else {
            console.log('No data found.');
        }
    });
}

async function selenium_automation() {
    console.log("Starting selenium driver... ");
    var chromeCapabilities = Capabilities.chrome();
    //setting chrome options to start the browser fully maximized
    var chromeOptions = {
        'args': ['--ignore-certificate-errors-spki-list', '--ignore-certificate-errors', '--ignore-ssl-errors', '--start-maximized']
    };
    chromeCapabilities.set('goog:chromeOptions', chromeOptions);

    let driver = await new Builder().forBrowser('chrome').withCapabilities(chromeCapabilities).build();
    try {
        for (const item of item_list) {
            // Navigate to Url
            await driver.get(item.link);

            for (let i = 0; i < item.quantity; i++) {
                let plus_btn = await driver.findElements(By.css("#ui-id-2 .xf-product-new-spinner__inc.js-spinner__inc"));
                // console.log(plus_btn);
                let executed = false;
                if (plus_btn.length != 0) {
                    // btn exists => click plus
                    try {
                        await plus_btn[0].click();
                        executed = true;
                    } catch {
                    }
                }

                if (!executed) {
                    // not exist => click buy or item out of stock
                    let buy_btn = await driver.findElements(By.css("#ui-id-2 button.xf-product-new__add-to-cart-btn.js-product__add"));
                    // console.log(buy_btn);
                    if (buy_btn.length != 0) {
                        try {
                            await buy_btn[0].click();
                            executed = true;
                        } catch{

                        }
                    }
                }
                if (!executed) {
                    console.log(item.name + " out of stock");
                }

                await driver.sleep(2000);
            }
        }
    }
    finally {
        // driver.close();
    }
}