import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Upload } from 'antd';
import { UploadOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../../utils/localStorageService';
import { useNotification, useTheme } from '../../store/context';

const signUpUser = async (data) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('confirmPassword', data.confirmPassword);
  formData.append('name', data.name);

  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }

  const response = await axios.post(`${baseUrl}/api/users/signup`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });

  return response.data;
};

const Signup = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const triggerNotification = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    profileImage: null,
  });

  const [fileList, setFileList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (info) => {
    setFormData((prevData) => ({
      ...prevData,
      profileImage: info.file.originFileObj,
    }));
    setFileList(info.fileList);
  };

  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => onSuccess('ok'), 1000);
  };

  const handleNavigate = () => {
    navigate('/auth/login');
  };
  const { mutate, isPending } = useMutation({
    mutationKey: ['signUpUser'],
    mutationFn: signUpUser,
    onSuccess: async (data) => {
      triggerNotification({
        type: 'success',
        message: 'Success',
        description: data.message || 'Sign up successful!',
      });
      await queryClient.invalidateQueries(['signUpUser']);
      navigate('/auth/login');
    },
    onError: (error) => {
      triggerNotification({
        type: 'error',
        message: 'Error',
        description: error?.response?.data?.message,
      });
    },
  });

  const handleSubmit = async () => {
    await form.validateFields();

    const dataToPost = {
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      name: formData.name,
      profileImage: formData.profileImage,
    };

    mutate(dataToPost);
  };

  return (
    <div className='p-5'>
      <div className='my-2'>
        <span>
          <button
            className={`focus:outline-none hover:text-[#FFA500] ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
          >
            <LeftOutlined className='mr-6' onClick={handleNavigate} />
          </button>
        </span>
        <span
          className={`text-lg font-semibold text-left ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        >
          Signup
        </span>
      </div>
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        initialValues={formData}
      >
        {/* Name Field */}
        <Form.Item
          label='Name'
          name='name'
          rules={[{ required: true, message: 'Please enter your name!' }]}
        >
          <Input
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='Enter your name'
          />
        </Form.Item>
        {/* Email Field */}
        <Form.Item
          label='Email'
          name='email'
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Invalid email!' },
          ]}
        >
          <Input
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='Enter your email'
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          label='Password'
          name='password'
          rules={[
            { required: true, message: 'Please enter your password!' },
            {
              min: 8,
              message: 'Password must be at least 8 characters long!',
            },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message:
                'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character!',
            },
          ]}
        >
          <Input.Password
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='Enter your password'
          />
        </Form.Item>
        {/* Confirm Password Field */}
        <Form.Item
          label='Confirm Password'
          name='confirmPassword'
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match!')
                );
              },
            }),
          ]}
        >
          <Input.Password
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder='Confirm your password'
          />
        </Form.Item>
        {/* Profile Image Upload */}
        <Form.Item label='Profile Image' name='profileImage'>
          <Upload
            name='profileImage'
            listType='picture'
            fileList={fileList}
            className='upload-list-inline'
            onChange={handleImageChange}
            customRequest={customRequest}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                triggerNotification({
                  type: 'error',
                  message: 'Error',
                  description: 'You can only upload image files!',
                });
              }
              return isImage;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
          </Upload>
        </Form.Item>
        {/* Submit Button */}
        <Form.Item>
          <div className='flex flex-col md:flex-row gap-1'>
            <Button
              htmlType='button'
              className='w-full py-2 h-full shadow-none'
              onClick={handleNavigate}
              disabled={isPending}
            >
              Signin
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              className='w-full py-2 h-full shadow-none'
              loading={isPending}
            >
              Signup
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Signup;
