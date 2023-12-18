function isUpperCase(str) {
  return str === str.toUpperCase() && str !== str.toLowerCase();
}

function isLowerCase(str) {
  return str === str.toLowerCase() && str !== str.toUpperCase();
}

function slugify(word) {
  return word.replaceAll("'", '-');
}

function escape(word) {
  return word.replaceAll("'", "\\'");
}

function capitalize(word) {
  return word && isLowerCase(word[0]) ? word[0].toUpperCase() + word.slice(1, word.length) : word;
}

function trimStr(word, chars) {
  let result = word;
  for (const str of chars) {
    if (word && word.startsWith(str)) {
      result = word.slice(str.length);
    }

    if (word && word.endsWith(str)) {
      result = word.slice(0, word.length - str.length);
    }
  }

  if (word !== result) {
    result = trimStr(result, chars);
  }

  return result;
}

function applyCorrection(word, candidate) {
  if (
    !window.wordsCommon.includes(word) &&
    !window.wordsWooordHunt.includes(word) &&
    (window.wordsCommon.includes(candidate) || window.wordsWooordHunt.includes(candidate))
  ) {
    return candidate;
  } else {
    return word;
  }
}

function getWordIndex(word, wordList = []) {
  const index = wordList.indexOf(word);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function compareWords([a, aExamples], [b, bExamples]) {
  // sort by examples in DESC order
  const examplesResult = bExamples.length - aExamples.length;

  if (examplesResult !== 0) {
    return examplesResult;
  }

  // sort by index in ASC order
  let aCommonIndex = getWordIndex(a, window.wordsCommon);
  let bCommonIndex = getWordIndex(b, window.wordsCommon);

  if (aCommonIndex === Number.MAX_SAFE_INTEGER && bCommonIndex === Number.MAX_SAFE_INTEGER) {
    aCommonIndex = getWordIndex(a, window.wordsWooordHunt);
    bCommonIndex = getWordIndex(b, window.wordsWooordHunt);
  }

  if (aCommonIndex === Number.MAX_SAFE_INTEGER && bCommonIndex === Number.MAX_SAFE_INTEGER) {
    aCommonIndex = getWordIndex(a, window.wordsIrregularVerbsList);
    bCommonIndex = getWordIndex(b, window.wordsIrregularVerbsList);
  }

  if (aCommonIndex === Number.MAX_SAFE_INTEGER && bCommonIndex === Number.MAX_SAFE_INTEGER) {
    aCommonIndex = getWordIndex(a, window.wordsAdjectiveComparativesList);
    bCommonIndex = getWordIndex(b, window.wordsAdjectiveComparativesList);
  }

  return aCommonIndex - bCommonIndex;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
