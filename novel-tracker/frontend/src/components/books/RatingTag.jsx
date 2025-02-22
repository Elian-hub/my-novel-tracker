import { Tag } from "antd";
import { StarFilled } from "@ant-design/icons";

const GradientStarRating = ({ rating }) => {
  let tagColor = "default";

  if (rating >= 4) {
    tagColor = "green";
  } else if (rating >= 2) {
    tagColor = "yellow";
  } else {
    tagColor = "red";
  }

  return (
    <Tag color={tagColor} className="py-1 px-2  text-center">
      <StarFilled />
      <span>{rating}</span>
    </Tag>
  );
};

export default GradientStarRating;
