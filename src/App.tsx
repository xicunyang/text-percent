import React, { useRef, useState } from "react";
import { Button, Input, InputNumber, Table } from "antd";
import "./App.css";
// @ts-ignore
import * as XLSX from "xlsx";
import { bingfa, genCopy } from "./utils";
import { compareSentences } from "./percentV2";
const worker = new Worker("work.js");

function App() {
  const [batchNum, setBatchNum] = React.useState(5);
  const [splitNum, setSplitNum] = React.useState(1000);
  const [currentProcess, setCurrentProcess] = React.useState(0);
  const [allCount, setAllCount] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [processArr, setProcessArr] = React.useState<
    Array<{
      all: number;
      current: number;
    }>
  >([]);

  const resultArr = useRef<Array<any>>([]);

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
        const SPLIT_NUM = splitNum;
        const splitRes = e.data.data;
        const { origin: originArr, split: splitArr } = splitRes;

        console.log("splitRes:::", splitRes);

        // @ts-ignore
        resultArr.current = originArr.map((_, index) => [
          {
            index,
          },
        ]);

        // @ts-ignore
        const chunkedArray: any[] = splitArr.reduce((result, item, index) => {
          const chunkIndex = Math.floor(index / SPLIT_NUM);

          if (!result[chunkIndex]) {
            result[chunkIndex] = []; // 创建新的分组
          }

          result[chunkIndex].push({
            origin: originArr[index],
            split: item,
          });
          return result;
        }, []);

        const _processArr = chunkedArray.map((i, index) => {
          return {
            all: index * SPLIT_NUM + i.length,
            current: index * SPLIT_NUM,
          };
        });

        // 创建进度
        setProcessArr(_processArr);

        const works = chunkedArray.map((items, index) => {
          const work = () => {
            return new Promise((r) => {
              const _worker = new Worker("calc-worker.js");

              _worker.postMessage({
                type: "calc",
                data: {
                  // @ts-ignore
                  splitArr: items.map((i) => i.split),
                  // @ts-ignore
                  originArr: items.map((i) => i.origin),
                  allSplitArr: splitArr,
                  allOriginArr: originArr,
                  index: index,
                  splitNum: SPLIT_NUM,
                },
              });

              _worker.onmessage = function (e) {
                const type = e.data.type;
                if (type === "process") {
                  const _index = e.data.data.calcIndex;

                  _processArr[index] = {
                    ..._processArr[index],
                    current: _index + 1,
                  };
                  setProcessArr([..._processArr]);
                } else if (type === "calcDone") {
                  const calcResult = e.data.data.calcResult;

                  const oldArr = [...resultArr.current];

                  // @ts-ignore
                  calcResult.forEach((item, idx) => {
                    const newIndex = index * SPLIT_NUM + idx;
                    oldArr[newIndex] = {
                      index: oldArr[newIndex][0].index,
                      ...item,
                    };
                  });

                  resultArr.current = oldArr;

                  setRefreshKey(new Date().getTime());
                  _worker.terminate();
                  r(e);
                }
              };
            });
          };

          return () => work();
        });

        bingfa(works, batchNum);
      } else if (e.data.type === "process") {
        setCurrentProcess(e.data.data);
      }
    };
    // eslint-disable-next-line
  }, [batchNum, splitNum]);

  const onChange = (ev: any) => {
    var reader = new FileReader();
    reader.onload = function (e: any) {
      try {
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: "binary" });
        var sheetNames = workbook.SheetNames; // 工作表名称集合
        var worksheet = workbook.Sheets[sheetNames[0]]; // 只读取第一张sheet

        var jsonArr: any[] = XLSX.utils.sheet_to_json(worksheet); //解析成html

        const contentArr = jsonArr.map((item) => {
          return item["内容"]?.replaceAll("\n","");
        });

        setAllCount(contentArr?.length);
        preDoSplit(contentArr);
        // preDoSplit([
        //   "一月十日早晨王俊凯请来货运车发货时，由于车辆较大，把李易峰家的网线跟监控线，挂断了，事后李某发现网络异常，出门查看，找到旁边货运司机理论索要赔偿，因意见不一致，产生纠纷，经祝某调解，双方达成一致，已和解。",
        //   "今天早晨祝某请来货运车发货时，由于车辆较大，把李某家的网线跟监控线，挂断了，事后李某发现网络异常，出门查看，找到旁边货运司机理论索要赔偿，因意见不一致，产生纠纷，经祝某调解，双方达成一致，已和解。",
        //   // "1",
        //   // "2",
        // ]);
      } catch (err) {
        console.log(err);
        return false;
      }
    };
    reader.readAsBinaryString(ev.target.files[0]);
  };

  const calcDone = React.useMemo(() => {
    if(!resultArr.current?.length) return;
    return resultArr.current.every(i => i.source)

  }, [refreshKey]);

  React.useEffect(() => {
    if (!calcDone) return;
    const cacheMap: Record<string, any> = {};

    resultArr.current.forEach((item) => {
      const key = item.targetIndex;
      cacheMap[key] = item;
    });

    resultArr.current.forEach((item, index) => {
      const sourceIndex = item.sourceIndex;
      const targetItem = cacheMap[sourceIndex];

      if (
        targetItem &&
        (targetItem?.percent > item?.percent ||
          (targetItem?.percent === 0 && item?.percent === 0))
      ) {
        resultArr.current[index] = {
          ...resultArr.current[index],
          targetIndex: targetItem.index,
          target: targetItem?.source,
          percent: targetItem?.percent,
        };
      }
    });

    setRefreshKey(new Date().getTime());
  }, [calcDone]);

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>并发计算数量(开启N个线程并发计算)：</div>
        <InputNumber
          style={{ width: "100px" }}
          placeholder="并发计算数量"
          value={batchNum}
          onChange={(e) => setBatchNum(Number(e))}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", marginTop: "16px" }}>
        <div>切片数量（把总条数切分，每个子条数的数量）：</div>
        <InputNumber
          style={{ width: "100px" }}
          placeholder="切片数量"
          value={splitNum}
          onChange={(e) => setSplitNum(Number(e))}
        />
      </div>

      <input style={{ marginTop: "16px" }} type="file" onChange={onChange} />

      {allCount > 0 && (
        <div style={{ marginTop: "16px" }}>
          分词中: {currentProcess + 1} / {allCount}
        </div>
      )}

      {Boolean(processArr?.length) && (
        <div style={{ marginTop: "16px" }}>
          <div>计算进度：</div>
          {processArr.map((item, idx) => {
            return (
              <div>
                {item.current}/{item.all}
              </div>
            );
          })}
        </div>
      )}

      {Boolean(calcDone) && (
        <Button
          style={{ marginTop: "16px" }}
          onClick={() => {
            const text = resultArr.current.map((i) => i.percent).join("\n");
            genCopy(text);
          }}
        >
          复制相似度结果
        </Button>
      )}

      {Boolean(calcDone) && (
        <Button
          style={{ marginTop: "16px", marginLeft :"16px"}}
          onClick={() => {
            const text = resultArr.current.map((i) => i.target).join("\n");
            genCopy(text);
          }}
        >
          复制相似度文案
        </Button>
      )}

      {calcDone && (
        <div>
          <Table
            key={refreshKey}
            style={{ marginTop: "16px" }}
            rowKey={"index"}
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
            dataSource={resultArr.current}
          />
        </div>
      )}
    </div>
  );
}

export default App;
