const CLIENT_ID = '1069804549642-eqdaumbemf26uln5hhje8utldgri74no.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBcqGvQkkQpa2xzpfYIEZztYHFiiULfcOw';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'].join(' ');

const BOUNDARY = 'foo_bar_baz';
const BACKUP_FILE_NAME = `subs_scanner_app_backup_${window.location.hostname}.json`;

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });

  googleAuth = window.gapi.auth2.getAuthInstance();

  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('google-authorize-button').style.display = 'block';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async response => {
    if (response.error !== undefined) {
      throw response;
    }

    // TODO get Google name or email
    // console.log('--------------------> gapi.client', gapi.client);
    // console.log('--------------------> google.accounts.oauth2', google.accounts.oauth2);
    // console.log('--------------------> google.accounts.id', google.accounts.id);
    //
    // console.log(
    //   'inii',
    //   google.accounts.id.initialize({
    //     client_id: CLIENT_ID,
    //     callback: (...args) => {
    //       console.log('initialize callback', args);
    //     },
    //   })
    // );
    // google.accounts.id.prompt();

    document.getElementById('google-signout-button').style.display = 'block';
    document.getElementById('cloud-backup-icon').style.display = 'block';
    setTimeout(() => document.getElementById('cloud-backup-icon').click(), 100);
    document.getElementById('google-authorize-button').style.display = 'none';
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    console.log('cons', tokenClient.requestAccessToken({ prompt: 'consent' }));
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    console.log('no cons', tokenClient.requestAccessToken({ prompt: '' }));
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');

    document.getElementById('google-authorize-button').style.display = 'block';
    document.getElementById('google-signout-button').style.display = 'none';
    document.getElementById('cloud-backup-icon').style.display = 'none';
  }
}

async function getGDriveBackupFileMetadata() {
  const listResponse = await gapi.client.drive.files.list({
    pageSize: 10,
    fields: 'files(id, name)',
    q: 'trashed=false',
  });

  const file = (listResponse?.result?.files || []).find(file => file.name === BACKUP_FILE_NAME);

  return file;
}

/**
 *
 * @param jsonContent string
 * @param fileId [string]
 * @returns {string}
 */
async function uploadGDriveBackup(jsonContent) {
  const file = await getGDriveBackupFileMetadata();

  const delimiter = '\r\n--' + BOUNDARY + '\r\n';
  const close_delim = '\r\n--' + BOUNDARY + '--';

  const fileMetadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonContent +
    '\r\n' +
    close_delim;

  request = gapi.client.request({
    path: `https://www.googleapis.com/upload/drive/v3/files${file ? '/' + file.id : ''}`,
    method: file ? 'PATCH' : 'POST',
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': 'multipart/related; boundary=' + BOUNDARY + '',
    },
    body: multipartRequestBody,
  });

  await new Promise(resolve => {
    request.execute(resp => {
      resolve(resp);
    });
  });
}

async function getGDriveBackup() {
  const emptyBackup = { version: 0, knownWords: [], toLearnWords: [], excludeWords: [] };

  const file = await getGDriveBackupFileMetadata();

  if (!file) {
    return emptyBackup;
  }

  const fileResponse = await gapi.client.drive.files.get({ fileId: file.id, alt: 'media' });

  if (
    !fileResponse?.result?.version ||
    !Array.isArray(fileResponse?.result?.knownWords) ||
    !Array.isArray(fileResponse?.result?.toLearnWords) ||
    !Array.isArray(fileResponse?.result?.excludeWords)
  ) {
    return emptyBackup;
  }

  return fileResponse.result;
}
