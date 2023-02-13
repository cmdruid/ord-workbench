const fs = require('fs');

const data = fs.readFileSync('ord-words.txt', 'utf-8');
const words = data.split('\n');

function getIndexByWordsAndNum(words, word1, word2, num) {
  let word1Index = words.indexOf(word1);
  if (word1Index === -1) return "doesn't exist"
  let word2Index = words.indexOf(word2);
  if (word2Index === -1) return "doesn't exist"

  if (word1Index > word2Index) {
      word2Index--;
  }
  return word1Index * (words.length - 1) + word2Index;
}

const word1 = process.argv[2];
const word2 = process.argv[3];
const num = parseInt(process.argv[4]);
console.log(getIndexByWordsAndNum(words, word1, word2, num));
