import React, { useState } from "react";
import { Button, Table } from "antd";
import "./App.css";
// @ts-ignore
import * as XLSX from "xlsx";
import { genCopy } from "./utils";
import { compareSentences } from "./percentV2";
const worker = new Worker("work.js");

function App() {
  const [percentArr, setPercentArr] = useState<any[]>([]);
  const [resultArr, setResultArr] = React.useState<Array<any>>([]);
  const [currentProcess, setCurrentProcess] = React.useState(0);
  const [allCount, setAllCount] = React.useState(0);

  const preDoSplit = (contentArr: string[]) => {
    worker.postMessage({
      type: "preSplit",
      data: contentArr,
    });
  };

  React.useEffect(() => {
    worker.onmessage = function (e) {
      // @ts-ignore
      if (e.data.type === "preSplit") {
        const splitRes = e.data.data;

        const { origin, split } = splitRes;
        const contentArr: string[] = origin;

        // 计算重合度
        const maxPercentIndexArr: number[] = [];
        const cache: any[] = [];

        contentArr.forEach((currentRowContent, index) => {
          const percentArr: number[] = [];
          contentArr.forEach((otherRowContent, otherIndex) => {
            if (index === otherIndex) {
              return;
            }

            const textAArr = split[index];
            const textBArr = split[otherIndex];
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

          maxPercentIndexArr.push(maxPercentIndex);

          cache.push({
            source: currentRowContent,
            target: contentArr[maxPercentIndex],
            percent: maxPercent,
          });
        });

        setResultArr(cache);

        console.log("cache:::", cache);

        setPercentArr(percentArr);
      } else if (e.data.type === "process") {
        console.log("data:::", e.data.data);
        setCurrentProcess(e.data.data);
      }
    };
  // eslint-disable-next-line
  }, []);

  const onChange = (ev: any) => {
    var reader = new FileReader();
    reader.onload = function (e: any) {
      try {
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: "binary" });
        var sheetNames = workbook.SheetNames; // 工作表名称集合
        var worksheet = workbook.Sheets[sheetNames[0]]; // 只读取第一张sheet

        var jsonArr: any[] = XLSX.utils.sheet_to_json(worksheet); //解析成html
        console.log("jsonArr:::", jsonArr);

        const contentArr = jsonArr.map((item) => {
          return item["内容"];
        });

        console.log("开始预处理split>>>");

        setAllCount(contentArr?.length);
        preDoSplit(contentArr);
      } catch (err) {
        console.log(err);
        return false;
      }
    };
    reader.readAsBinaryString(ev.target.files[0]);
  };

  return (
    <div style={{ padding: "16px" }}>
      <input type="file" onChange={onChange} />

      {allCount > 0 && (
        <div style={{ marginTop: "16px" }}>
          分词中: {currentProcess} / {allCount}
        </div>
      )}

      {Boolean(resultArr?.length) && (
        <Button
          style={{ marginTop: "16px" }}
          onClick={() => {
            const text = resultArr.map((i) => i.percent).join("\n");

            genCopy(text);
          }}
        >
          复制结果
        </Button>
      )}

      <div>
        <Table
          style={{ marginTop: "16px" }}
          columns={[
            { title: "源文本", dataIndex: "source" },
            { title: "最相似目标文本", dataIndex: "target" },
            {
              title: "相似度",
              dataIndex: "percent",
              sorter: (a, b) => a.percent - b.percent,
              defaultSortOrder: "descend",
            },
          ]}
          dataSource={resultArr}
        />
      </div>
    </div>
  );
}

export default App;
