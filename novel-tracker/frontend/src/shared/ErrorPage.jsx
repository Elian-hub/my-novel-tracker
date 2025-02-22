import { Button, Alert } from "antd";

const ErrorPage = ({ description, onRetry }) => {
  return (
    <div className="flex justify-center items-center pt-10">
      <Alert
        message="Something went wrong!"
        description={description}
        type="error"
        showIcon
        action={
          <Button size="small" type="link" onClick={onRetry}>
            Retry
          </Button>
        }
        className="mb-4"
      />
    </div>
  );
};

export default ErrorPage;
