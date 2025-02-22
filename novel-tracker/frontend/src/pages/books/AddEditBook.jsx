import { useEffect, useState } from "react";
import { Form, Input, Button, Upload } from "antd";
import { LeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../utils/localStorageService";
import ErrorPage from "../../shared/ErrorPage";
import { useNotification } from "../../store/context";
import Loader from "../../shared/Loader";

const fetchBookData = async (bookId) => {
  try {
    const response = await axiosInstance.get(`/api/books/get-book/${bookId}`);
    const data = await response.data;
    return data;
  } catch (error) {
    console.error("Error fetching book data:", error);
    throw error;
  }
};

// API Calls for add/edit book
const addBookMutation = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("author", data.author);
  formData.append("description", data.description);
  formData.append("numberOfPages", data.numberOfPages);
  formData.append("bookImage", data.bookImage);

  try {
    const response = await axiosInstance.post("/api/books/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

const updateBookMutation = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("author", data.author);
  formData.append("description", data.description);
  formData.append("numberOfPages", data.numberOfPages);

  if (data.currentImageUrl) {
    formData.append("currentImageUrl", data.currentImageUrl);
  }

  if (data.bookImage) {
    formData.append("bookImage", data.bookImage);
  }

  try {
    const response = await axiosInstance.put(
      `/api/books/update/${data.bookId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

const AddEditBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const triggerNotification = useNotification();

  const [fileList, setFileList] = useState([]);
  const [bookImage, setBookImage] = useState(null);
  const [noUpload, setNoUpload] = useState(true);

  const handleImageChange = (info) => {
    setBookImage(info.file.originFileObj);
    setFileList(info.fileList);
  };

  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => onSuccess("ok"), 1000);
  };

  // Fetch book data for editing
  const {
    data: bookData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookData", bookId],
    queryFn: () => fetchBookData(bookId),
    enabled: !!bookId,
  });

  // Set form values for editing
  useEffect(() => {
    if (noUpload && bookData?.book?.imageUrl) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: bookData.book.imageUrl,
        },
      ]);
    }
  }, [bookData, form, noUpload]);

  // Mutation for add/edit book
  const mutationFn = bookId ? updateBookMutation : addBookMutation;

  const { mutate, isPending: loading } = useMutation({
    mutationKey: ["bookData", bookId],
    mutationFn,
    onMutate: async (data) => {
      if (bookId) {
        await queryClient.cancelQueries({ queryKey: ["bookData", bookId] });

        const previousData = queryClient.getQueryData(["bookData", bookId]);
        queryClient.setQueryData(["bookData", bookId], (oldData) => ({
          ...oldData,
          ...data,
        }));
        return { previousData };
      }
    },
    onError: (error, newData, context) => {
      console.log(error);
      // Rollback to previous data if optimistic update fails
      if (bookId && context?.previousData) {
        queryClient.setQueryData(["bookData", bookId], context.previousData);
      }

      const errorMessage =
        error.response?.data?.message || "Failed to update book";

      triggerNotification({
        type: "error",
        message: "Error",
        description: errorMessage,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["bookData", bookId]);
      queryClient.invalidateQueries(["books"]);

      const successMessage =
        data?.message ||
        (bookId ? "Book updated successfully!" : "Book added successfully!");

      triggerNotification({
        type: "success",
        message: "Success",
        description: successMessage,
      });

      navigate("/books");
    },
    onSettled: () => {
      // Invalidate to refetch and sync the latest data
      queryClient.invalidateQueries(["bookData", bookId]);
      queryClient.invalidateQueries(["books"]);
    },
  });

  const onFinish = async (values) => {
    const data = {
      title: values?.title,
      author: values?.author,
      description: values?.description,
      numberOfPages: values?.numberOfPages,
      bookImage,
      ...(bookId ? { bookId, currentImageUrl: bookData?.book?.imageUrl } : {}),
    };

    mutate(data);
  };

  if (isLoading) return <Loader />;

  if (isError) {
    const errorDescription = error?.response?.data?.message || error?.message;

    return (
      <ErrorPage description={errorDescription} onRetry={() => refetch()} />
    );
  }

  return (
    <div className="px-6 py-3">
      <div>
        <span>
          <button className="focus:outline-none hover:text-[#FFA500]">
            <LeftOutlined className="w-8 h-8" onClick={() => navigate(-1)} />
          </button>
        </span>
        <span className="text-[16px] font-semibold leading-[24px] text-left">
          {bookId ? "Edit Book" : "Add New Book"}
        </span>
      </div>

      <p className="text-sm text-gray-500 text-left mb-4">
        {bookId
          ? "Update the book details in your library."
          : "Add books to your library to manage and keep track of your books."}
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
        initialValues={{
          title: bookData?.book?.title,
          author: bookData?.book?.author,
          description: bookData?.book?.description,
          numberOfPages: bookData?.book?.numberOfPages,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the book title" }]}
          >
            <Input placeholder="Enter book title" />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[
              { required: true, message: "Please enter the book author" },
            ]}
          >
            <Input placeholder="Enter book author" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the book description" },
            ]}
          >
            <Input.TextArea placeholder="Enter book description" />
          </Form.Item>

          <Form.Item
            name="numberOfPages"
            label="Number of Pages"
            rules={[
              { required: true, message: "Please enter the number of pages" },
            ]}
          >
            <Input placeholder="Enter number of pages" type="number" />
          </Form.Item>

          <Form.Item label="Book Image" name="bookImage">
            <Upload
              name="bookImage"
              listType="picture"
              fileList={fileList}
              className="upload-list-inline"
              onChange={handleImageChange}
              customRequest={customRequest}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  triggerNotification({
                    type: "error",
                    message: "Error",
                    description: "You can only upload image files!",
                  });
                  return Upload.LIST_IGNORE;
                }
                setNoUpload(false);
                return isImage;
              }}
              maxCount={1} // Limit to a single file
            >
              <Button icon={<UploadOutlined />}>Upload Book Image</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full md:w-1/2 py-1.5 h-full shadow-none text-base"
          >
            {bookId ? "Update Book" : "Add Book"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddEditBook;
