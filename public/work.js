importScripts("./segmentit.js");

const segmentit = Segmentit.useDefault(new Segmentit.Segment());

const splitText = (text) => {
  return segmentit.doSegment(text).map((i) => i.w);
};

self.onmessage = function (e) {
  const type = e.data.type;

  console.log('type:::', type);
  if (type === "preSplit") {
    const contentList = e.data.data;
    const result = [];
    contentList.forEach((content, index) => {
      const splitRes = splitText(content);
      result.push(splitRes);
      self.postMessage({
        type: "process",
        data: index
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
