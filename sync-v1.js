/**
 *
 * @param key string
 * @returns {string[]}
 */
function readListFromLocalStorage(key) {
  let backupWords = [];

  if (localStorage.getItem(key)) {
    try {
      const parsedBackup = JSON.parse(localStorage.getItem(key));

      if (Array.isArray(parsedBackup) && parsedBackup.every(w => typeof w === 'string')) {
        backupWords = parsedBackup;
      }
    } catch (error) {
      console.log('--------------------> FAILED TO PARSE local library from storage', error);
    }
  }

  return backupWords;
}

/**
 *
 * @param payload.version number
 * @param payload.knownWords string[]
 * @param payload.excludeWords string[]
 * @param payload.toLearnWords string[]
 */
function writeToLocalStorage(payload) {
  const { version, knownWords, excludeWords, toLearnWords } = payload;
  const sanitize = list => JSON.stringify([...new Set(list)].sort());

  localStorage.setItem('backupVersion', (+version).toString());
  localStorage.setItem('knownWords', sanitize(knownWords));
  localStorage.setItem('excludeWords', sanitize(excludeWords));
  localStorage.setItem('toLearnWords', sanitize(toLearnWords));
}

/**
 *
 * @returns {{version: number, knownWords: string[], toLearnWords: string[], excludeWords: string[]}}
 */
function readFromLocalStorage() {
  const version = Number.parseInt(localStorage.getItem('backupVersion'));
  const knownWords = readListFromLocalStorage('knownWords');
  const toLearnWords = readListFromLocalStorage('toLearnWords');
  const excludeWords = readListFromLocalStorage('excludeWords');

  return {
    version: Number.isInteger(version) && version > 0 ? version : 0,
    knownWords,
    toLearnWords,
    excludeWords,
  };
}
