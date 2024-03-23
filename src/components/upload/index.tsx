import React from "react";
import { Upload as AntUpload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { formatXlsxFileToJson } from "../../helper/xlsx";

const { Dragger } = AntUpload;

interface IProps {
  onChange?: (json: any[]) => void;
}
const Upload: React.FC<IProps> = ({ onChange }) => {
  const handleChange = (info: any) => {
    if (info.fileList?.length) {
      message.loading("上传中");
      setTimeout(async () => {
        if (info.file) {
          const res = await formatXlsxFileToJson(info.file);
          res && onChange?.(res as any[]);
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
      style={{ width: "600px" }}
      name="file"
      multiple={false}
      maxCount={1}
      onChange={handleChange}
      beforeUpload={() => {
        return false;
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或者拖动文件到当前区域进行上传</p>
      <p className="ant-upload-hint">
        仅支持Excel(xlsx后缀)文件，数据条数尽量保证小于等于5w条
      </p>
    </Dragger>
  );
};

export default Upload;
