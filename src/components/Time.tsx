import React from "react";
import "./index.css";
import * as XLSX from "xlsx";
import moment from "moment";
import { calcTime, formatTime } from "./helper";
import { Button, Table } from "antd";
import { genCopy } from "../utils";

const changeDate = (timeNum: number) => {
  const d = timeNum - 1;
  const t = Math.round((d - Math.floor(d)) * 24 * 60 * 60);
  return moment(new Date(1900, 0, d, 0, 0, t)).format("YYYY-MM-DD HH:mm:ss");
};

interface IProps {}
const Time: React.FC<IProps> = () => {
  const [result, setResult] = React.useState([]);

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
          const time = item["上报时间"];
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
      } catch (err) {
        console.log(err);
        return false;
      }
    };
    reader.readAsBinaryString(ev.target.files[0]);
  };

  return (
    <div className="time-main">
      <input type="file" onChange={onChange} />

      {Boolean(result?.length) && (
        <div>
          <Button
            style={{ marginTop: "16px" }}
            onClick={() => {
              // @ts-ignore
              const text = result.map((i) => i.isSame).join("\n");
              genCopy(text);
            }}
          >
            复制时间是否准确列
          </Button>
        </div>
      )}

      {Boolean(result?.length) && (
        <div>
          <Button
            style={{ marginTop: "16px" }}
            onClick={() => {
              // @ts-ignore
              const text = result.map((i) => i.pickTime).join("\n");
              genCopy(text);
            }}
          >
            复制文本内的时间列
          </Button>
        </div>
      )}

      <Table
        style={{ marginTop: "16px" }}
        rowKey={"index"}
        columns={[
          { title: "源文本", dataIndex: "content" },
          { title: "文本内的时间", dataIndex: "pickTime", width: "120px" },
          { title: "上报时间", dataIndex: "time", width: "120px" },
          {
            title: "时间是否准确",
            dataIndex: "isSame",
            width: "140px",
          },
        ]}
        dataSource={result}
      />
    </div>
  );
};

export default Time;
