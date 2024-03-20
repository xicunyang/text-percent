importScripts("./segmentit.js");

const segmentit = Segmentit.useDefault(new Segmentit.Segment());

function convertText(text) {
  // 将连续超过50个中文字符之间插入逗号或空格
  var result = text
    .replace(/([\u4e00-\u9fa5]{50})([\u4e00-\u9fa5])/g, "$1，$2")
    .replace(/([\u4e00-\u9fa5]{50})([a-zA-Z0-9])/g, "$1，$2")
    .replace(/([a-zA-Z0-9])([\u4e00-\u9fa5]{50})/g, "$1，$2");
  return result;
}

const splitText = (text) => {
  try {
    return segmentit.doSegment(text).map((i) => i.w);
  } catch (e) {
    console.log("e:::", e);
  }
};

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

const batchDoSentences = (splitArr, originArr) => {
  let chunkedArray = originArr.reduce((result, item, index) => {
    const chunkIndex = Math.floor(index / 1000);

    if (!result[chunkIndex]) {
      result[chunkIndex] = []; // 创建新的分组
    }

    result[chunkIndex].push({
      origin: item,
      split: originArr[index],
    });
    return result;
  }, []);

  console.log("chunkedArray:::", chunkedArray);

  const maxPercentIndexArr = [];
  const cache = [];

  originArr.forEach((currentRowContent, index) => {
    const percentArr = [];
    originArr.forEach((otherRowContent, otherIndex) => {
      if (index === otherIndex) {
        return;
      }

      const textAArr = splitArr[index];
      const textBArr = splitArr[otherIndex];
      const percent = compareSentences(textAArr, textBArr);
      percentArr.push(percent);
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

    maxPercentIndexArr.push(maxPercentIndex);

    cache.push({
      source: currentRowContent,
      target: originArr[maxPercentIndex],
      percent: maxPercent,
    });

    console.log("index:::", index);
  });

  console.log("cache:::", cache);
};

self.onmessage = function (e) {
  const type = e.data.type;

  console.log("type:::", type);
  if (type === "preSplit") {
    const contentList = e.data.data;
    const result = [];
    contentList.forEach((content, index) => {
      const splitRes = splitText(convertText(content));
      result.push(splitRes);
      self.postMessage({
        type: "process",
        data: index,
      });
    });

    // batchDoSentences(result, contentList);

    self.postMessage({
      type: "preSplit",
      data: {
        origin: contentList,
        split: result,
      },
    });
  } else if (type === "") {
  }
};
