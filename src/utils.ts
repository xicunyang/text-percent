interface IVector {
  [key: string]: number;
}

// 函数计算词频
function termFrequency(words: string[]) {
  const termFrequency: Record<string, number> = {};
  words.forEach((word) => {
    termFrequency[word] = (termFrequency[word] || 0) + 1;
  });
  return termFrequency;
}

// 函数计算向量点积
function dotProduct(vectorA: IVector, vectorB: IVector) {
  let product = 0;
  for (const key in vectorA) {
    if (vectorB.hasOwnProperty(key)) {
      product += vectorA[key] * vectorB[key];
    }
  }
  return product;
}

// 函数计算向量的模
function vectorMagnitude(vector: IVector) {
  let magnitude = 0;
  for (const key in vector) {
    magnitude += vector[key] ** 2;
  }
  return Math.sqrt(magnitude);
}

// 计算余弦相似度
export function cosineSimilarity(textAArr: string[], textBArr: string[]) {
  const termFrequencyA = termFrequency(textAArr);
  const termFrequencyB = termFrequency(textBArr);

  const dotProd = dotProduct(termFrequencyA, termFrequencyB);
  const magnitudeA = vectorMagnitude(termFrequencyA);
  const magnitudeB = vectorMagnitude(termFrequencyB);

  if (magnitudeA && magnitudeB) {
    return dotProd / (magnitudeA * magnitudeB);
  } else {
    return 0;
  }
}

export const genCopy = (text: string) => {
  // 创建一个 textarea 元素用于存放文本
  var textarea = document.createElement("textarea");
  textarea.textContent = text;

  // 将 textarea 元素添加到页面中
  document.body.appendChild(textarea);

  // 选中 textarea 中的文本
  textarea.select();

  // 将选中的文本复制到剪贴板
  document.execCommand("copy");

  // 移除 textarea 元素
  document.body.removeChild(textarea);
};
