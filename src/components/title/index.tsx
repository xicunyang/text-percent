import React from "react";

interface IProps {
  title?: string;
}
const Title: React.FC<IProps> = ({ title = "文本余弦相似度计算" }) => {
  return (
    <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
      {title}
    </div>
  );
};

export default Title;
