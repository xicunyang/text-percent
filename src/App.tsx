import React, { useRef } from "react";
import { Button, InputNumber, Table, Tooltip, message } from "antd";
import "./App.css";
// @ts-ignore
import * as XLSX from "xlsx";
import { bingfa, genCopy } from "./utils";
import HelperIcon from "./components/helper-icon";
import Upload from "./components/upload";
import Title from "./components/title";
const worker = new Worker("work.js");

const DefaultBatchNum = 5;
const DefaultSplitNum = 1000;

function App() {
  const [batchNum, setBatchNum] = React.useState(DefaultBatchNum);
  const [splitNum, setSplitNum] = React.useState(DefaultSplitNum);
  const [currentProcess, setCurrentProcess] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [processArr, setProcessArr] = React.useState<
    Array<{
      all: number;
      current: number;
    }>
  >([]);
  const [uploadJsonArr, setUploadJsonArr] = React.useState<any[]>([]);

  const resultArr = useRef<Array<any>>([]);

  const preDoSplit = (contentArr: string[]) => {
    worker.postMessage({
      type: "preSplit",
      data: contentArr,
    });
  };

  const handleReset = () => {
    setCurrentProcess(0);
    setProcessArr([]);
    resultArr.current = [];
    setRefreshKey(new Date().getTime());
  }

  React.useEffect(() => {
    worker.onmessage = function (e) {
      // @ts-ignore
      if (e.data.type === "preSplit") {
        worker.terminate();
        
        const SPLIT_NUM = splitNum;
        const splitRes = e.data.data;
        const { origin: originArr, split: splitArr } = splitRes;

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

  const handleUploadChange = (jsonList: any[]) => {
    handleReset();

    const contentArr = jsonList.map((item) => {
      return item["内容"]?.replaceAll("\n", "");
    });

    setUploadJsonArr(contentArr);
  };

  const calcDone = React.useMemo(() => {
    if (!resultArr.current?.length) return;
    return resultArr.current.every((i) => i.source);
  }, [refreshKey]);

  React.useEffect(() => {
    if (!calcDone) return;
    const cacheMap: Record<string, any> = {};

    resultArr.current.forEach((item) => {
      const key = item.targetIndex;
      if (cacheMap[key]) {
        if (cacheMap[key].percent < item.percent) {
          cacheMap[key] = item;
        }
      } else {
        cacheMap[key] = item;
      }
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

  const handleDoCalc = () => {
    preDoSplit(uploadJsonArr);
  };

  return (
    <div style={{ padding: "16px" }}>
      <Title title="文本余弦相似度计算 ( v1.0 )" />

      <Upload onChange={handleUploadChange} />

      {Boolean(uploadJsonArr?.length) && (
        <>
          <div style={{ marginTop: "16px" }}>
            总行数: {uploadJsonArr?.length}
          </div>

          <div
            style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
          >
            <div>
              并发计算数量
              <HelperIcon tooltipTitle={"开启N个线程并发计算"} />：
            </div>
            <InputNumber
              style={{ width: "100px" }}
              placeholder="并发计算数量"
              value={batchNum}
              onChange={(e) => setBatchNum(Number(e))}
            />
          </div>

          <div
            style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
          >
            <div>
              切片数量
              <HelperIcon tooltipTitle={"把总条数切分，每个子条数的数量"} />：
            </div>
            <InputNumber
              style={{ width: "100px" }}
              placeholder="切片数量"
              value={splitNum}
              onChange={(e) => setSplitNum(Number(e))}
            />
          </div>

          <Tooltip
            title={uploadJsonArr?.length ? "" : "请上传文件后再开始分析"}
            placement="right"
          >
            <Button
              disabled={!Boolean(uploadJsonArr?.length)}
              style={{ marginTop: "16px" }}
              type="primary"
              onClick={handleDoCalc}
            >
              开始分析
            </Button>
          </Tooltip>

          {currentProcess > 0 && (
            <div style={{ marginTop: "16px" }}>
              预分词进度: {currentProcess + 1} / {uploadJsonArr.length}
            </div>
          )}

          {Boolean(processArr?.length) && (
            <div style={{ marginTop: "16px" }}>
              {processArr?.length === 1 ? (
                <div>
                  计算进度: {processArr?.[0]?.current} / {processArr?.[0]?.all}
                </div>
              ) : (
                <>
                  <div>计算进度: </div>
                  {processArr.map((item, idx) => {
                    return (
                      <div>
                        {item.current} / {item.all}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {Boolean(calcDone) && (
            <Button
              style={{ marginTop: "16px" }}
              onClick={() => {
                const text = resultArr.current.map((i) => i.percent).join("\n");
                genCopy(text);
                message.success("复制成功");
              }}
            >
              复制相似度结果
            </Button>
          )}

          {Boolean(calcDone) && (
            <Button
              style={{ marginTop: "16px", marginLeft: "16px" }}
              onClick={() => {
                const text = resultArr.current.map((i) => i.target).join("\n");
                genCopy(text);
                message.success("复制成功");
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
        </>
      )}
    </div>
  );
}

export default App;
