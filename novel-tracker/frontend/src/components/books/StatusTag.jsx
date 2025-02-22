import { Tag } from "antd";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

export const statusOptions = [
  {
    value: "finished",
    label: "Finished",
    icon: <CheckCircleOutlined />,
    color: "green",
  },
  {
    value: "reading",
    label: "Reading",
    icon: <ClockCircleOutlined />,
    color: "blue",
  },
  {
    value: "not-started",
    label: "Not Started",
    icon: <CloseCircleOutlined />,
    color: "gray",
  },
];

const StatusTag = ({ status }) => {
  const { label, icon, color } = statusOptions.find(
    (option) => option.value === status
  );

  const classes = "py-1 px-3 border-[1.5px] text-center";

  return (
    <Tag className={classes} color={color} aria-label={label}>
      {icon}
      <span className="uppercase font-semibold">{label}</span>
    </Tag>
  );
};

export default StatusTag;
