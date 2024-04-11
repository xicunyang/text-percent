import React from "react";
import { Upload as AntUpload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { formatCSVFileToJson, formatXlsxFileToJson } from "../../helper/xlsx";

const { Dragger } = AntUpload;

interface IProps {
  onChange?: (json: any[]) => void;
  width?: string;
  titleText?: string;
  secText?: string;
  isCSV?: boolean;
}
const Upload: React.FC<IProps> = ({
  width = "600px",
  titleText = "点击或者拖动文件到当前区域进行上传",
  secText = "文件，数据条数尽量保证小于等于5w条",
  isCSV,
  onChange,
}) => {
  const handleChange = (info: any) => {
    if (info.fileList?.length) {
      message.loading("上传中");
      setTimeout(async () => {
        if (info.file) {
          if (isCSV) {
            const res = await formatCSVFileToJson(info.file);
            res && onChange?.(res as any[]);
          } else {
            const res = await formatXlsxFileToJson(info.file);
            res && onChange?.(res as any[]);
          }
        }
        message.destroy();
        message.success("上传成功");
      }, 300);
    } else {
      onChange?.([]);
    }
  };

  return (
    <Dragger
      style={{ width }}
      name="file"
      multiple={false}
      maxCount={1}
      onChange={handleChange}
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      beforeUpload={() => {
        return false;
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{titleText}</p>
      <p className="ant-upload-hint">{secText}</p>
    </Dragger>
  );
};

export default Upload;
