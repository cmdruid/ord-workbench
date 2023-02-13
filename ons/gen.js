let males = require('@stdlib/datasets-male-first-names-en');
let females = require('@stdlib/datasets-female-first-names-en');
let english = require('an-array-of-english-words')
let spanish = require('an-array-of-spanish-words')
let french = require('an-array-of-french-words')
const fs = require('fs');

// 1. get a big word list with names and common words
const wordsAry = english.concat(females()).concat(males()).concat(spanish).concat(french)
let wordList = [];

// 2. randomize the word list
for(let i=1; i < wordsAry.length; i++){
  let randomNumber = Math.floor(Math.random() * (wordsAry.length)) + 1;
  let randomName = wordsAry[randomNumber]
  if(randomName) {
    wordList.push(randomName?.toLowerCase())
  }
}

// 3. remove duplicates
const deduplicatedArray = Array.from(new Set(wordList));

// 4. save to file
fs.writeFile('ord-words.txt', deduplicatedArray.join('\n'), (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});

