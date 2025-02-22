import { Form, Input, Button, notification } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { queryClient, setSessionData } from "../../utils/localStorageService";
import { useNotification, useTheme } from "../../store/context";

const loginUser = async (data) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const response = await axios.post(`${baseUrl}/api/users/login`, data, {
    withCredentials: true,
  });
  return response.data;
};

const Login = () => {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const triggerNotification = useNotification();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleNavigate = () => {
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["loginUser"],
    mutationFn: loginUser,
    onSuccess: async (data) => {
      triggerNotification({
        type: "success",
        message: "Login Success",
        description: data?.message ?? "User credentials verified successfully!",
      });

      setSessionData({
        ...data?.user,
        ...data?.tokens,
      });
      await queryClient.invalidateQueries(["loginUser"]);
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error);
      triggerNotification({
        type: "error",
        message: "Login Error",
        description:
          error?.response?.data?.message ??
          "Please check your credentials and try again!",
      });
    },
  });

  const handleSubmit = async () => {
    await form.validateFields();
    mutate(formData);
  };

  return (
    <div className="p-4 w-full">
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
          Signin
        </span>
      </div>

      <Form
        form={form}
        name="login"
        className="mt-8"
        layout="vertical"
        autoComplete="off"
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
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              htmlType="button"
              className="w-full py-2 h-full shadow-none"
              onClick={() => navigate("/auth/signup")}
              disabled={isPending}
            >
              Signup
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-2 h-full shadow-none"
              loading={isPending}
              onClick={handleSubmit}
            >
              Signin
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p
              className="text-[#FFA500] hover:text-[#c9a25a] hover:underline hover:cursor-pointer"
              onClick={() => navigate("/auth/forgot-password")}
            >
              Forgot Your Password?
            </p>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
