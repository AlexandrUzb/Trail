/**
 * Transliteration utility for Uzbek Cyrillic <-> Latin
 * Enables bidirectional cross-script search (Latin user query matches Cyrillic law and vice versa)
 */

const cyrToLatMap = {
  'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
  'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e',
  'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j', 'З': 'Z', 'з': 'z',
  'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
  'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
  'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r',
  'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u',
  'Ф': 'F', 'ф': 'f', 'Х': 'X', 'х': 'x', 'Ц': 'Ts', 'ц': 'ts',
  'Ч': 'Ch', 'ч': 'ch', 'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Sh', 'щ': 'sh',
  'Ъ': "'", 'ъ': "'", 'Ь': '', 'ь': '', 'Э': 'E', 'э': 'e',
  'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
  'Ў': 'O‘', 'ў': 'o‘', 'Ғ': 'G‘', 'ғ': 'g‘', 'Қ': 'Q', 'қ': 'q', 'Ҳ': 'H', 'ҳ': 'h'
};

const latToCyrPairs = [
  ['oʻ', 'ў'], ['o‘', 'ў'], ['o\'', 'ў'], ['Oʻ', 'Ў'], ['O‘', 'Ў'], ['O\'', 'Ў'],
  ['gʻ', 'ғ'], ['g‘', 'ғ'], ['g\'', 'ғ'], ['Gʻ', 'Ғ'], ['G‘', 'Ғ'], ['G\'', 'Ғ'],
  ['sh', 'ш'], ['Sh', 'Ш'], ['SH', 'Ш'],
  ['ch', 'ч'], ['Ch', 'Ч'], ['CH', 'Ч'],
  ['yo', 'ё'], ['Yo', 'Ё'], ['YO', 'Ё'],
  ['yu', 'ю'], ['Yu', 'Ю'], ['YU', 'Ю'],
  ['ya', 'я'], ['Ya', 'Я'], ['YA', 'Я'],
  ['ts', 'ц'], ['Ts', 'Ц'], ['TS', 'Ц'],
  ['a', 'а'], ['A', 'А'], ['b', 'б'], ['B', 'Б'], ['d', 'д'], ['D', 'Д'],
  ['e', 'е'], ['E', 'Е'], ['f', 'ф'], ['F', 'Ф'], ['g', 'г'], ['G', 'Г'],
  ['h', 'ҳ'], ['H', 'Ҳ'], ['i', 'и'], ['I', 'И'], ['j', 'ж'], ['J', 'Ж'],
  ['k', 'к'], ['K', 'К'], ['l', 'л'], ['L', 'Л'], ['m', 'м'], ['M', 'М'],
  ['n', 'н'], ['N', 'Н'], ['o', 'о'], ['O', 'О'], ['p', 'п'], ['P', 'П'],
  ['q', 'қ'], ['Q', 'Қ'], ['r', 'р'], ['R', 'Р'], ['s', 'с'], ['S', 'С'],
  ['t', 'т'], ['T', 'Т'], ['u', 'у'], ['U', 'У'], ['v', 'в'], ['V', 'В'],
  ['x', 'х'], ['X', 'Х'], ['y', 'й'], ['Y', 'Й'], ['z', 'з'], ['Z', 'З'],
  ["'", 'ъ'], ['`', 'ъ'], ['’', 'ъ']
];

export function cyrillicToLatin(str) {
  if (!str) return '';
  return str.replace(/Ў|ў|Ғ|ғ|Қ|қ|Ҳ|ҳ|Ё|ё|Ю|ю|Я|я|Ч|ch|Ш|sh|Щ|sh|Ц|ts|[А-Яа-яЪъЬь]/g, char => (char in cyrToLatMap ? cyrToLatMap[char] : char));
}

export function latinToCyrillic(str) {
  if (!str) return '';
  let res = str;
  for (const [lat, cyr] of latToCyrPairs) {
    res = res.replaceAll(lat, cyr);
  }
  return res;
}

export function normalizeSearchText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[ʻ‘'`]/g, "'")
    .replace(/[^\w\sа-яёўғқҳ\']/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
