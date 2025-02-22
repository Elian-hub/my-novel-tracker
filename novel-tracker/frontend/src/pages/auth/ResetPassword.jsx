import { Form, Input, Button, notification } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNotification, useTheme } from "../../store/context";
import { useEffect } from "react";

const resetPassword = async ({ password, token }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await axios.post(
    `${baseUrl}/api/users/reset-password/${token}`,
    { password },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const triggerNotification = useNotification();

  const { token } = useParams();

  const [form] = Form.useForm();

  const { mutate, isPending } = useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: (values) => resetPassword({ ...values, token }),
    onSuccess: (data) => {
      triggerNotification({
        type: "success",
        message: "Success",
        description: data?.message ?? "Password reset successful!",
      });
      navigate("/login");
    },
    onError: (error) => {
      triggerNotification({
        type: "error",
        message: "Error",
        description:
          error?.response?.data?.message ??
          "Failed to reset password. Please try again!",
      });
    },
  });

  const handleSubmit = (values) => {
    if (values.password !== values.confirmPassword) {
      triggerNotification({
        type: "error",
        message: "Error",
        description: "Passwords do not match!",
      });
      return;
    }

    mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-400 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-full">
              <LockOutlined className="text-white text-xl" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </p>
        </div>

        <div
          className={`bg-white rounded-lg shadow-sm p-6 md:p-10 ${
            theme === "dark" ? "dark:bg-stone-900" : ""
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Requirements */}
            <div>
              <p
                className={`text-base font-semibold text-gray-800 mb-4 flex items-center ${
                  theme === "dark" ? "dark:text-white" : ""
                }`}
              >
                <CheckCircleOutlined className="mr-2 text-orange-500" />
                Password Requirements
              </p>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <ul className="space-y-3">
                  {[
                    "Minimum 8 characters long",
                    "At least 1 uppercase letter",
                    "At least 1 lowercase letter",
                    "At least 1 number",
                    "At least 1 special character",
                  ].map((requirement, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-orange-700"
                    >
                      <CheckCircleOutlined className="mr-2 text-green-500" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              <Form
                form={form}
                name="reset-password"
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                className="space-y-4"
              >
                <Form.Item
                  name="password"
                  label="New Password"
                  rules={[
                    {
                      required: true,
                      message: "Please input your new password!",
                    },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters long!",
                    },
                    {
                      pattern:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: "Password must meet all requirements!",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder="Enter your new password"
                    className="rounded-md"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords do not match!")
                        );
                      },
                    }),
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder="Confirm your new password"
                    className="rounded-md"
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full shadow-none py-2 h-full border-none rounded-md"
                    loading={isPending}
                  >
                    Reset Password
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
