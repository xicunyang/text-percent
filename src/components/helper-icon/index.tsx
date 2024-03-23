import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import React from "react";

interface IProps {
  tooltipTitle?: string;
}
const HelperIcon: React.FC<IProps> = ({ tooltipTitle }) => {
  return (
    <Tooltip title={tooltipTitle}>
      <QuestionCircleOutlined
        style={{ color: "black", fontSize: "14px", marginLeft: "4px" }}
      />
    </Tooltip>
  );
};

export default HelperIcon;
