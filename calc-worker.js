// 计算线程

function getWordFrequencies(tokens) {
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

function dotProduct(vec1, vec2) {
  let sum = 0;
  for (const key in vec1) {
    if (vec2.hasOwnProperty(key)) {
      sum += vec1[key] * vec2[key];
    }
  }
  return sum;
}

function magnitude(vec) {
  let sum = 0;
  for (const key in vec) {
    sum += vec[key] * vec[key];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vec1, vec2) {
  return dotProduct(vec1, vec2) / (magnitude(vec1) * magnitude(vec2));
}

function compareSentences(sentence1, sentence2) {
  const wordFrequencies1 = getWordFrequencies(sentence1);
  const wordFrequencies2 = getWordFrequencies(sentence2);

  return cosineSimilarity(wordFrequencies1, wordFrequencies2);
}

self.onmessage = function (e) {
  const type = e.data.type; // "calc"

  if (type === "calc") {
    const splitArr = e.data?.data?.splitArr; // [["我", "好像"...],[],[]]
    const originArr = e.data?.data?.originArr; // [["我", "好像"...],[],[]]
    const allSplitArr = e.data?.data?.allSplitArr; // [["我", "好像"...],[],[]]
    const allOriginArr = e.data?.data?.allOriginArr; // [["我", "好像"...],[],[]]
    const groupIndex = e.data?.data?.index; // [["我", "好像"...],[],[]]
    const splitNum = e.data?.data?.splitNum; // [["我", "好像"...],[],[]]

    const cache = [];

    // 初始化数组遍历（切片）
    originArr.forEach((currentRowContent, index) => {
      const percentArr = [];
      // 当前下标
      const calcIndex = groupIndex * splitNum + index;
      const afterArr = allOriginArr.slice(calcIndex + 1);
      const afterSplitArr = allSplitArr.slice(calcIndex + 1);

      afterArr.forEach((_, otherIndex) => {
        percentArr.push(compareSentences(splitArr[index], afterSplitArr[otherIndex]));
      });

      // 取最大值
      let maxPercent = 0;
      let maxPercentIndex = 0;

      percentArr.forEach((currentPercent, index) => {
        if (currentPercent > maxPercent) {
          maxPercentIndex = index;
          maxPercent = currentPercent;
        }
      });

      // @ts-ignore
      delete percentArr;

      cache.push({
        source: currentRowContent,
        target: afterArr[maxPercentIndex],
        percent: maxPercent,
        sourceIndex: calcIndex,
        targetIndex: maxPercentIndex + calcIndex + 1,
      });

      self.postMessage({
        type: "process",
        data: {
          calcIndex: calcIndex,
        },
      });
    });

    self.postMessage({
      type: "calcDone",
      data: {
        calcResult: cache,
      },
    });
  }
};
