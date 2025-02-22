import { Form, Input, Button, notification } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNotification, useTheme } from "../../store/context";

const requestPasswordReset = async (data) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.post(
    `${baseUrl}/api/users/forgot-password`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const triggerNotification = useNotification();

  const [email, setEmail] = useState("");

  const handleNavigate = () => {
    navigate("/auth/login");
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["requestPasswordReset"],
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      triggerNotification({
        type: "success",
        message: "Success",
        description: data?.message ?? "Password reset link sent to your email!",
      });
      navigate("/auth/login");
    },
    onError: (error) => {
      triggerNotification({
        type: "error",
        message: "Error",
        description:
          error?.response?.data?.message ??
          "Failed to send password reset link. Please try again!",
      });
    },
  });

  const handleSubmit = (values) => {
    mutate({ email: values.email });
  };

  return (
    <div className="p-5 w-full">
      <div className="my-2">
        <span>
          <button
            className={`focus:outline-none hover:text-[#FFA500] ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            <LeftOutlined className="mr-6" onClick={handleNavigate} />
          </button>
        </span>
        <span
          className={`text-lg font-semibold text-left ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Forgot Password
        </span>
      </div>

      <Form
        name="forgot-password"
        className="mt-8"
        layout="vertical"
        autoComplete="off"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your email!",
            },
            {
              type: "email",
              message: "Please enter a valid email!",
            },
          ]}
        >
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full shadow-none py-2 h-full"
            loading={isPending}
          >
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;
