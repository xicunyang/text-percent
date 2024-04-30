import React from "react";
import "./index.css";
import moment from "moment";
import { Button, Select, Table, message } from "antd";
import { genCopy } from "../utils";
import Title from "./title";
import Upload from "./upload";
import {
  SPLIT_FLAG,
  calcTimes,
  getTimes,
  handleCalcUsualWork,
} from "../helper/active";
import _, { unionBy } from "lodash";

const DefaultSelectTitles = ["区县", "街道", "村", "网格"];
const FixRows = ["B", "C", "D", "E"];
const DefaultSelectTitlesForAction = [
  "(SELECTC.ORGNAMEFROMORGANIZATIONSCWHEREC.ID=(SELECTB.PARENTIDFROMORGANIZATIONSBWHEREB.ID=(SELECTA.PARENTIDFROMORGANIZATIONSAWHEREA.ID=ORG.PARENTID)))",
  "(SELECTB.ORGNAMEFROMORGANIZATIONSBWHEREB.ID=(SELECTA.PARENTIDFROMORGANIZATIONSAWHEREA.ID=ORG.PARENTID))",
  "(SELECTA.ORGNAMEFROMORGANIZATIONSAWHEREA.ID=ORG.PARENTID)",
  "网格",
];
interface IProps {}
const Active: React.FC<IProps> = () => {
  const [result, setResult] = React.useState<
    Array<{
      [index: string]: string;
    }>
  >([]);
  const [uploadJsonArr, setUploadJsonArr] = React.useState<any[]>([]);
  const [allGridArr, setAllGridArr] = React.useState<any[]>([]);
  const [uploadJsonArrForAction, setUploadJsonArrForAction] = React.useState<
    any[]
  >([]);
  const [selectTitles, setSelectTitles] = React.useState<string[]>([]);
  const [selectTitlesForAction, setSelectTitlesForAction] = React.useState<
    string[]
  >([]);

  const handleReset = () => {
    setResult([]);
  };

  const usualWorkTitles = React.useMemo(() => {
    handleReset();
    if (uploadJsonArr.length) {
      const firstRow = uploadJsonArr[0];
      const list = Object.keys(firstRow).map((key) => {
        return {
          label: key,
          value: key,
        };
      });
      return list;
    }
    return [];
  }, [uploadJsonArr]);

  const allGridList = React.useMemo(() => {
    const listArr = allGridArr.map((item) => {
      return [item.县区, item.街镇, item.村社, item.网格].join(SPLIT_FLAG);
    });
    return listArr;
  }, [allGridArr]);

  const actionTitles = React.useMemo(() => {
    handleReset();
    if (uploadJsonArrForAction.length) {
      const firstRow = uploadJsonArrForAction[0];
      const list = Object.keys(firstRow).map((key) => {
        return {
          label: key,
          value: key,
        };
      });
      return list;
    }
    return [];
  }, [uploadJsonArrForAction]);

  const workTimes = React.useMemo(() => {
    return getTimes(uploadJsonArr).join("，");
  }, [uploadJsonArr]);

  const actionTimes = React.useMemo(() => {
    return getTimes(uploadJsonArrForAction).join("，");
  }, [uploadJsonArrForAction]);

  const handleCalc = () => {
    const works = handleCalcUsualWork(uploadJsonArr, selectTitles);
    const actions = handleCalcUsualWork(
      uploadJsonArrForAction,
      selectTitlesForAction
    );

    const result = calcTimes(allGridList, works, actions);

    const allDays = unionBy([
      ...workTimes.split("，"),
      ...actionTimes.split("，"),
    ]);
    const sortedAllDays = allDays.sort((a, b) => {
      if (moment(a) > moment(b)) {
        return 1;
      }
      return -1;
    });
    console.log("sortedAllDays:::", sortedAllDays);

    // 县区  街镇 村社  网格  开展工作天数   事件上报天数
    const fValue = Object.keys(result).map((resultKey) => {
      const gridArr = resultKey.split(SPLIT_FLAG);
      const 开展工作天数 = unionBy([
        ...(result[resultKey].actionDays || []),
        ...(result[resultKey].workDays || []),
      ]);

      let dynamicMap: Record<string, number> = {};
      allDays.forEach((day) => {
        let isWork = false;
        let isAction = false;
        if (result[resultKey].workDays?.includes(day)) {
          isWork = true;
        }
        if (result[resultKey].actionDays?.includes(day)) {
          isAction = true;
        }
        // @ts-ignore
        dynamicMap[day] =
          isWork && isAction ? 1 : isAction ? 1 : isWork ? 2 : "";
      });

      return {
        name: gridArr.join("____"),
        县区: gridArr[0],
        街镇: gridArr[1],
        村社: gridArr[2],
        网格: gridArr[3],
        ...dynamicMap,
        开展工作天数: 开展工作天数.length,
        事件上报天数: result[resultKey].actionDays?.length || 0,
      };
    });

    setResult(fValue as any);

    console.log("fValue:::", fValue);
  };

  const sortedAllDays = React.useMemo(() => {
    const allDays = unionBy([
      ...workTimes.split("，"),
      ...actionTimes.split("，"),
    ]);
    const sortedAllDays = allDays.sort((a, b) => {
      if (moment(a) > moment(b)) {
        return 1;
      }
      return -1;
    });
    return sortedAllDays;
  }, [workTimes, actionTimes]);

  const columns = React.useMemo(() => {
    const _sort = sortedAllDays.map((item) => {
      const dayOfWeek = moment(item).format("d");
      const week = ["日", "一", "二", "三", "四", "五", "六"][dayOfWeek as any];
      return {
        title:
          // <div style={{textAlign: "center"}}>
          //   {/* <div>星期{week}</div> */}
          //   <div>{item}</div>
          // </div>
          item,
        dataIndex: item,
      };
    });

    return [
      { title: "县区", dataIndex: "县区", fixed: "left" },
      { title: "街镇", dataIndex: "街镇", fixed: "left" },
      { title: "村社", dataIndex: "村社", fixed: "left" },
      { title: "网格", dataIndex: "网格", fixed: "left" },
      ..._sort,
      {
        title: "开展工作天数",
        dataIndex: "开展工作天数",
        fixed: "right",
        // @ts-ignore
        // sorter: (a, b) => a.开展工作天数 - b.开展工作天数,
      },
      { title: "事件上报天数", dataIndex: "事件上报天数", fixed: "right" },
    ];
  }, [sortedAllDays]);

  const handleCopy = () => {
    const title = columns.map((item) => item.title).join("	");
    const content = result.map((row) => {
      const rows = [row.县区, row.街镇, row.村社, row.网格];
      sortedAllDays.forEach((day) => {
        rows.push(row[day] || "");
      });
      rows.push(row.开展工作天数);
      rows.push(row.事件上报天数);
      return rows.join("	");
    });
    content.unshift(title);
    genCopy(content.join("\n"));
    message.success("复制成功");
  };

  return (
    <div className="time-main">
      <Title title="网格活跃度 ( v1.1 )" />

      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "8px" }}>
          <Upload
            width="100%"
            onChange={setAllGridArr}
            titleText="请上传《全量网格信息》Excel"
          />
        </div>
        <div style={{ marginRight: "8px" }}>
          <Upload
            width="100%"
            onChange={setUploadJsonArr}
            onHeaderChange={(headers) => {
              const firstRow = headers?.[0];
              if (firstRow) {
                const result = Object.keys(firstRow)
                  .map((key) => {
                    if (FixRows.includes(key)) {
                      return firstRow[key];
                    }
                  })
                  .filter(Boolean);
                setSelectTitles(result);
              }
            }}
            titleText="请上传《例行工作》Excel"
          />
        </div>
        <Upload
          width="100%"
          onChange={setUploadJsonArrForAction}
          onHeaderChange={(headers) => {
            const firstRow = headers?.[0];
            if (firstRow) {
              const result = Object.keys(firstRow)
                .map((key) => {
                  if (FixRows.includes(key)) {
                    return firstRow[key];
                  }
                })
                .filter(Boolean);

              setSelectTitlesForAction(result);
            }
          }}
          titleText="请上传《事件》Excel"
        />
      </div>

      {Boolean(usualWorkTitles.length && actionTitles.length) && (
        <div style={{ marginTop: "50px" }}>
          <div>
            <div>"例行工作"文件包含的时间: {workTimes}</div>
            <div>"事件"文件包含的时间: {actionTimes}</div>
          </div>

          <div>
            选择"例行工作"网格列：
            <Select
              options={usualWorkTitles}
              style={{ width: "200px", marginTop: "12px" }}
              value={selectTitles}
              mode="multiple"
              onChange={(val, options) => {
                // @ts-ignore
                const checkeds = options.map((i) => i.value);
                const filters = usualWorkTitles
                  .filter((i) => checkeds.includes(i.value))
                  .map((i) => i.value);
                setSelectTitles(filters);
              }}
            ></Select>
          </div>
          <div>
            选择"事件"网格列：
            <Select
              options={actionTitles}
              value={selectTitlesForAction}
              style={{ width: "200px", marginTop: "12px" }}
              mode="multiple"
              onChange={(val, options) => {
                // @ts-ignore
                const checkeds = options.map((i) => i.value);
                const filters = actionTitles
                  .filter((i) => checkeds.includes(i.value))
                  .map((i) => i.value);
                setSelectTitlesForAction(filters);
              }}
            ></Select>
          </div>
        </div>
      )}

      {Boolean(selectTitlesForAction.length && selectTitles.length) && (
        <div style={{ marginTop: "16px" }}>
          {/* <div>
            设置为开展工作
            <InputNumber
              style={{ margin: "0 8px" }}
              value={workTimeCount}
              //  @ts-ignore
              onInput={setWorkTimeCount}
            />
            天，其中上报事件为
            <InputNumber
              style={{ margin: "0 8px" }}
              value={actionTimeCount}
              //  @ts-ignore
              onInput={setActionTimeCount}
            />
            天
          </div> */}
          <div style={{ marginTop: "16px" }}>
            <Button type="primary" onClick={handleCalc}>
              开始分析
            </Button>
            {Boolean(result.length) && (
              <Button
                type="primary"
                onClick={handleCopy}
                style={{ marginLeft: "16px" }}
              >
                复制结果
              </Button>
            )}
          </div>

          {result.length > 0 && (
            <Table
              style={{ marginTop: "16px" }}
              rowKey={"name"}
              // @ts-ignore
              columns={columns}
              dataSource={result}
              scroll={{
                x: "max-content",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Active;
