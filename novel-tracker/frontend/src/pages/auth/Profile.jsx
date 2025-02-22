import React, { useEffect, useState } from "react";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { Button, App, Form, Input, Avatar, Card, Modal } from "antd";
import { getSessionData, queryClient } from "../../utils/localStorageService";
import { useMutation } from "@tanstack/react-query";
import { useFormData, useNotification } from "../../store/context";
import axiosInstance from "../../utils/axiosInstance";
import EditProfile from "../../components/auth/EditProfile";

const deleteUser = async ({ email }) => {
  const response = await axiosInstance.delete("/api/users/delete-account", {
    data: { email },
  });
  return response.data;
};

const ProfilePage = () => {
  const { modal } = App.useApp();
  const { setFormData } = useFormData();
  const [session, setSession] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const triggerNotification = useNotification();

  useEffect(() => {
    const userData = getSessionData();
    setSession(userData);
  }, []);

  // Delete invoice using React Query
  const { mutate, isPending } = useMutation({
    queryKey: ["deleteUser"],
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["loginUser"]);
      triggerNotification({
        type: "success",
        message: "Success",
        description: "Account deleted successfully",
      });

      localStorage.clear();
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      triggerNotification({
        type: "error",
        message: "Error",
        description: "Failed to delete account",
      });
    },
  });

  const handleDeleteAccount = () => {
    modal.confirm({
      title: "Are you sure you want to delete your account?",
      content:
        "This action cannot be undone. All of your data will be permanently removed from our servers and cannot be recovered.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        mutate({
          email: session?.email,
        });
      },
    });
  };

  return (
    <div className="p-6">
      <Card className="border-none shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={session?.imageUrl}
                className="border-4 border-blue-50"
              />
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                className="absolute bottom-0 right-0"
                onClick={() => {
                  setIsModalVisible(true);
                  setFormData((prev) => ({
                    ...prev,
                    ...session,
                  }));
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-0">
                {session?.name || "Not provided"}
              </p>
              <p className="text-gray-500 text-sm">Account Owner</p>
            </div>
          </div>

          <Form layout="vertical" className="w-full p-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <Form.Item label="Name">
                <Input
                  className="h-full text-base py-2 px-3"
                  value={session?.name}
                  readOnly
                />
              </Form.Item>
              <Form.Item label="Email">
                <Input
                  className="h-full text-base py-2 px-3"
                  value={session?.email}
                  readOnly
                />
              </Form.Item>
              <Button
                type="primary"
                danger
                loading={isPending}
                className="w-full mt-6 shadow-none h-full text-base"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </Form>
        </div>

        <Modal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          title="Edit Profile"
          width={720}
          className="edit-profile-modal"
          styles={{
            body: {
              padding: "24px",
            },
          }}
        >
          <EditProfile onCancel={() => setIsModalVisible(false)} />
        </Modal>
      </Card>
    </div>
  );
};

export default ProfilePage;
