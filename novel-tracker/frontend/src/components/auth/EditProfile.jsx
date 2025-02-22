import { Form, Input, Button, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useFormData, useNotification } from "../../store/context";
import { useMutation } from "@tanstack/react-query";
import {
  getSessionData,
  queryClient,
  setSessionData,
} from "../../utils/localStorageService";
import axiosInstance from "../../utils/axiosInstance";

const updateUserProfile = async (userData) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("email", userData.email);
  formData.append("oldEmail", userData.oldEmail);

  if (userData.profileImage) {
    formData.append("profileImage", userData.profileImage);
  }

  if (userData.currentProfileImage) {
    formData.append("currentProfileImage", userData.currentProfileImage);
  }

  const response = await axiosInstance.put(
    "/api/users/update-account",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const EditProfile = ({ onCancel }) => {
  const [form] = Form.useForm();
  const triggerNotification = useNotification();
  const session = getSessionData();

  const { formData, setFormData } = useFormData();
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const { mutate, isPending } = useMutation({
    mutationKey: ["updateUserProfile"],
    mutationFn: updateUserProfile,
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries(["updateUserProfile"]);

      const previousData = queryClient.getQueryData(["updateUserProfile"]);

      queryClient.setQueryData(["updateUserProfile"], (old) => ({
        ...old,
        ...newData,
      }));

      // Return the context for rollback
      return { previousData };
    },
    onSuccess: (data) => {
      // Update session data with new user info
      const currentSession = getSessionData();
      setSessionData({
        ...currentSession,
        ...data?.user,
      });

      // Show success notification
      triggerNotification({
        type: "success",
        message: "Success",
        description: data?.message || "Profile updated successfully!",
      });

      setTimeout(() => {
        onCancel();
        window.location.reload();
      }, 2000);
    },
    onError: (error, newData, context) => {
      console.error("Error updating profile:", error);
      // Rollback to previous data if optimistic update fails
      if (context?.previousData) {
        queryClient.setQueryData(["updateUserProfile"], context.previousData);
      }

      // Show error notification
      triggerNotification({
        type: "error",
        message: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
      });
    },
    onSettled: () => {
      // Invalidate to refetch and sync the latest data
      queryClient.invalidateQueries(["updateUserProfile"]);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      triggerNotification({
        type: "error",
        message: "Please select an image file!",
        description: "You can only upload image files!",
      });
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      triggerNotification({
        type: "error",
        message: "Image must be smaller than 2MB!",
        description: "Please select an image smaller than 2MB.",
      });
      return Upload.LIST_IGNORE;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
    return false;
  };

  const handleProfileUpdate = async () => {
    mutate({
      ...formData,
      oldEmail: session?.email,
      profileImage: imageFile,
      currentProfileImage: formData?.imageUrl,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleProfileUpdate}
      initialValues={formData}
    >
      <div className="mb-6 text-center">
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          maxCount={1}
        >
          {previewImage || formData?.imageUrl ? (
            <img
              src={previewImage || formData?.imageUrl}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <div>
              <PlusOutlined />
              <div className="mt-2">Upload Photo</div>
            </div>
          )}
        </Upload>
        <p className="mt-2 text-gray-500 text-sm">
          Click to upload profile picture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input
            placeholder="Enter your full name"
            name="name"
            value={formData?.name}
            onChange={handleInputChange}
          />
        </Form.Item>

        <Form.Item name="email" label="Email">
          <Input
            placeholder="Enter your email"
            name="email"
            value={formData?.email}
            onChange={handleInputChange}
          />
        </Form.Item>
      </div>

      <Form.Item className="mb-0">
        <Button
          type="primary"
          className="py-2 h-full text-base"
          htmlType="submit"
          loading={isPending}
          block
        >
          {isPending ? "Updating Profile..." : "Update Profile"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditProfile;
