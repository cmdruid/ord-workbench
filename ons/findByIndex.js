const fs = require('fs');

const data = fs.readFileSync('ord-words.txt', 'utf-8');
const words = data.split('\n');

function getMashupWord(words, n) {
    let word1Index = Math.floor(n / (words.length - 1));
    let word2Index = n % (words.length - 1);
    if (word2Index >= word1Index) {
    word2Index++;
    }
    let num = n % 100;
    return words[word1Index] + words[word2Index] + num.toString().padStart(2, '0');
}

const satsIndex = process.argv[2]
console.log(getMashupWord(words, satsIndex));

