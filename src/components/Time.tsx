import React from "react";
import "./index.css";
import moment from "moment";
import { calcTime, formatTime } from "./helper";
import { Button, Table, Tooltip, message } from "antd";
import { genCopy } from "../utils";
import Title from "./title";
import Upload from "./upload";

export const changeDate = (timeNum: number) => {
  const d = timeNum - 1;
  const t = Math.round((d - Math.floor(d)) * 24 * 60 * 60);
  return moment(new Date(1900, 0, d, 0, 0, t)).format("YYYY-MM-DD HH:mm:ss");
};

interface IProps {}
const Time: React.FC<IProps> = () => {
  const [result, setResult] = React.useState([]);
  const [uploadJsonArr, setUploadJsonArr] = React.useState<any[]>([]);

  const handleUploadChange = (jsonList: any[]) => {
    setResult([]);
    setUploadJsonArr(jsonList);
  };

  const handleDoCalc = () => {
    const contentArr = uploadJsonArr.map((item) => {
      const time = item["CREATEDATE"];
      const _time = typeof time === "number" ? changeDate(time) : "-";

      const calcRes = calcTime(item["内容"]);

      const pickTime = formatTime(calcRes.matches?.[0] || "文本内无时间");
      const times = moment(_time).format("MM-DD");
      const isSame =
        pickTime && pickTime === times
          ? "符合"
          : pickTime === "文本内无时间"
          ? "文本无时间"
          : "时间不吻合";
      return {
        res0: calcRes.matches?.[0],
        content: item["内容"],
        pickTime,
        time: times,
        isSame,
      };
    });
    // @ts-ignore
    setResult(contentArr);
  };

  return (
    <div className="time-main">
      <Title title="时间合法过滤 ( v1.2 )" />

      <Upload onChange={handleUploadChange} />

      {Boolean(uploadJsonArr?.length) && (
        <>
          <div style={{ marginTop: "16px" }}>
            总行数: {uploadJsonArr?.length}
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

          {Boolean(result?.length) && (
            <div>
              <Button
                style={{ marginTop: "16px" }}
                onClick={() => {
                  // @ts-ignore
                  const text = result.map((i) => i.isSame).join("\n");
                  genCopy(text);
                  message.success("复制成功");
                }}
              >
                复制【时间是否准确】列
              </Button>

              <Button
                style={{ marginLeft: "16px" }}
                onClick={() => {
                  // @ts-ignore
                  const text = result.map((i) => i.pickTime).join("\n");
                  genCopy(text);
                  message.success("复制成功");
                }}
              >
                复制【文本内的时间】列
              </Button>
            </div>
          )}

          {Boolean(result?.length) && (
            <Table
              style={{ marginTop: "16px" }}
              rowKey={"index"}
              columns={[
                { title: "源文本", dataIndex: "content" },
                {
                  title: "文本内的时间",
                  dataIndex: "pickTime",
                  width: "120px",
                },
                { title: "上报时间", dataIndex: "time", width: "120px" },
                {
                  title: "时间是否准确",
                  dataIndex: "isSame",
                  width: "140px",
                },
              ]}
              dataSource={result}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Time;
