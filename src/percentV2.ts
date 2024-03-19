function getWordFrequencies(tokens: string[]) {
  const frequencies = {};
  tokens.forEach(function (token) {
    // @ts-ignore
    if (frequencies[token]) {
      // @ts-ignore
      frequencies[token] += 1;
    } else {
      // @ts-ignore
      frequencies[token] = 1;
    }
  });
  return frequencies;
}

function dotProduct(vec1: any, vec2: any) {
  let sum = 0;
  for (const key in vec1) {
    if (vec2.hasOwnProperty(key)) {
      sum += vec1[key] * vec2[key];
    }
  }
  return sum;
}

function magnitude(vec: any) {
  let sum = 0;
  for (const key in vec) {
    sum += vec[key] * vec[key];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vec1: any, vec2: any) {
  return dotProduct(vec1, vec2) / (magnitude(vec1) * magnitude(vec2));
}

export function compareSentences(sentence1: string[], sentence2: string[]) {
  const wordFrequencies1 = getWordFrequencies(sentence1);
  const wordFrequencies2 = getWordFrequencies(sentence2);

  return cosineSimilarity(wordFrequencies1, wordFrequencies2);
}