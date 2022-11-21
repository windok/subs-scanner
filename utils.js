function isUpperCase(str) {
  return str === str.toUpperCase() && str !== str.toLowerCase();
}

function isLowerCase(str) {
  return str === str.toLowerCase() && str !== str.toUpperCase();
}

function slugify(word) {
  return word.replaceAll('\'', '-');
}

function escape(word) {
  return word.replaceAll('\'', '\\\'');
}

function applyCorrection(word, candidate) {
  if (!window.wordsCommon.includes(word) &&
    !window.wordsWooordHunt.includes(word) && (
      window.wordsCommon.includes(candidate) ||
      window.wordsWooordHunt.includes(candidate)
    )) {
    return candidate;
  } else {
    return word;
  }
}

function compareWords([a, aExamples], [b, bExamples]) {
  // sort by examples in DESC order
  const examplesResult = bExamples.length - aExamples.length;

  if (examplesResult !== 0) {
    return examplesResult;
  }

  // sort by index in ASC order
  let aCommonIndex = window.wordsCommon.indexOf(a);
  let bCommonIndex = window.wordsCommon.indexOf(b);
  aCommonIndex = aCommonIndex >= 0 ? aCommonIndex : Number.MAX_SAFE_INTEGER;
  bCommonIndex = bCommonIndex >= 0 ? bCommonIndex : Number.MAX_SAFE_INTEGER;

  if (aCommonIndex === Number.MAX_SAFE_INTEGER && bCommonIndex === Number.MAX_SAFE_INTEGER) {
    aCommonIndex = window.wordsWooordHunt.indexOf(a);
    bCommonIndex = window.wordsWooordHunt.indexOf(b);
    aCommonIndex = aCommonIndex >= 0 ? aCommonIndex : Number.MAX_SAFE_INTEGER;
    bCommonIndex = bCommonIndex >= 0 ? bCommonIndex : Number.MAX_SAFE_INTEGER;
  }

  return aCommonIndex - bCommonIndex;
}