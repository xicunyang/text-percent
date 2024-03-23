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

self.onmessage = function (e) {
  const type = e.data.type;
  
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
