import React from "react";
import "./index.css";
import moment from "moment";
import { calcTime, formatTime } from "./helper";
import { Button, Input, Table, Tag, Tooltip, message } from "antd";
import { genCopy } from "../utils";
import Title from "./title";
import Upload from "./upload";

export const changeDate = (timeNum: number) => {
  const d = timeNum - 1;
  const t = Math.round((d - Math.floor(d)) * 24 * 60 * 60);
  return moment(new Date(1900, 0, d, 0, 0, t)).format("YYYY-MM-DD HH:mm:ss");
};

interface IProps {}
const Keyword: React.FC<IProps> = () => {
  const [result, setResult] = React.useState([]);
  const [uploadJsonArr, setUploadJsonArr] = React.useState<any[]>([]);
  const [includeTextStr, setIncludeTextStr] = React.useState("");
  const [excludeTextStr, setExcludeTextStr] = React.useState("");

  const handleUploadChange = (jsonList: any[]) => {
    setResult([]);
    setUploadJsonArr(jsonList);
  };

  const includeTextArr = React.useMemo(() => {
    return includeTextStr?.split("、").filter(Boolean);
  }, [includeTextStr]);

  const excludeTextArr = React.useMemo(() => {
    return excludeTextStr?.split("、").filter(Boolean);
  }, [excludeTextStr]);

  const handleCalc = () => {
    const result = uploadJsonArr.map((item) => {
      const content: string = item.内容;
      let flag = "否";
      let hasInclude = false;
      let hasExclude = false;
      const includes: string[] = [];
      const excludes: string[] = [];
      if (includeTextArr.length) {
        // 任一关键词包含
        hasInclude = includeTextArr.some((includeText) => {
          if (content.includes(includeText)) {
            includes.push(includeText);
            return true;
          }
        });
      } else {
        hasInclude = true;
      }

      if (excludeTextArr.length) {
        // 任一关键词排除
        hasExclude = excludeTextArr.some((excludeText) => {
          if (content.includes(excludeText)) {
            excludes.push(excludeText);
            return false;
          }
          return true;
        });
      } else {
        hasExclude = true;
      }

      // 任一关键词包含 & 任一关键词排除 都命中，记录
      if (hasInclude && hasExclude) {
        flag = "是";
      }

      return {
        // name: item.name,
        content: item.内容,
        flag,
        includes: includes.join("、"),
        excludes: excludes.join("、"),
      };
    });
    console.log("result:::", result);

    // @ts-ignore
    setResult(result);
  };

  const handleCopy = () => {
    // @ts-ignore
    const text = result.map((i) => i.flag).join("\n");
    genCopy(text);
    message.success("复制成功");
  };

  return (
    <div className="time-main">
      <Title title="关键词过滤 ( v1.0 )" />

      <div style={{ display: "flex", alignItems: "center" }}>
        <div>
          <div>包含：</div>
          <Input.TextArea
            style={{ marginTop: "8px", width: "400px" }}
            value={includeTextStr}
            // @ts-ignore
            onInput={(e) => setIncludeTextStr(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: "8px" }}>
          <div>排除：</div>
          <Input.TextArea
            style={{ marginTop: "8px", width: "400px" }}
            value={excludeTextStr}
            // @ts-ignore
            onInput={(e) => setExcludeTextStr(e.target.value)}
          />
        </div>
      </div>

      <div style={{ color: "red", fontSize: "12px", marginTop: "8px" }}>
        注意！关键词使用“顿号”分隔，如：关键词1、关键词2、关键词3
      </div>

      <div style={{ marginTop: "8px" }}>
        <div>
          已解析的“包含”关键词:{" "}
          {includeTextArr.map((item, index) => (
            <Tag key={item + index}>{item}</Tag>
          ))}
        </div>
        <div style={{ marginTop: "8px" }}>
          已解析的“排除”关键词:{" "}
          {excludeTextArr.map((item, index) => (
            <Tag key={item + index}>{item}</Tag>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Upload
          width="808px"
          onChange={handleUploadChange}
          titleText={
            <div>
              请上传《事件》Excel
              <div style={{ color: "gray", fontSize: "12px" }}>
                默认读取表格中的“内容”列
              </div>
            </div>
          }
        />
      </div>

      {Boolean(uploadJsonArr.length) && (
        <div style={{ marginTop: "8px" }}>
          <Button type="primary" onClick={handleCalc}>
            开始分析
          </Button>

          <Button
            style={{ marginLeft: "8px" }}
            type="primary"
            onClick={handleCopy}
          >
            复制计算结果列
          </Button>
        </div>
      )}

      {Boolean(result.length) && (
        <Table
          style={{ marginTop: "16px" }}
          rowKey={"index"}
          columns={[
            { title: "内容", dataIndex: "content" },
            { title: "计算结果", dataIndex: "flag", width: "100px" },
            { title: "命中包含关键词", dataIndex: "includes", width: "150px" },
            { title: "命中排除关键词", dataIndex: "excludes", width: "150px" },
          ]}
          dataSource={result}
        />
      )}
    </div>
  );
};

export default Keyword;
