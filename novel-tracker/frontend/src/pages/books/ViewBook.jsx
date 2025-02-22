import React, { useState } from "react";
import { Form, Input, InputNumber, Rate, Row, Col, Button, App } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import ErrorPage from "../../shared/ErrorPage";
import Loader from "../../shared/Loader";
import { useNotification } from "../../store/context";
import { queryClient } from "../../utils/localStorageService";

const fetchBookData = async (bookId) => {
  const response = await axiosInstance.get(`/api/books/get-book/${bookId}`);
  return response.data;
};

const resetBookForRereading = async (bookId) => {
  const response = await axiosInstance.put("api/stats/reset", {
    bookId,
  });
  return response.data;
};

const updateBookProgress = async (data) => {
  const response = await axiosInstance.put("api/stats/update", data);
  return response.data;
};

const ViewBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { modal } = App.useApp();

  const triggerNotification = useNotification();

  const [pagesReadToday, setPagesReadToday] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

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

  // Update book progress
  const { mutate: updateProgress, isPending: isUpdating } = useMutation({
    mutationFn: updateBookProgress,
    onSuccess: (data) => {
      triggerNotification({
        type: "success",
        message: "Success",
        description: data?.message || "Book progress updated successfully",
      });

      queryClient.invalidateQueries(["books"]);
      navigate("/books");
    },
    onError: (error) => {
      console.error("Error updating book progress:", error);
      triggerNotification({
        type: "error",
        message: "Error",
        description:
          error?.response?.data?.message || "Failed to update book progress",
      });
    },
  });

  // Reset book for re-reading
  const { mutate, isPending } = useMutation({
    queryKey: ["resetBook"],
    mutationFn: resetBookForRereading,
    onSuccess: (data) => {
      triggerNotification({
        type: "success",
        message: "Success",
        description: data?.message || "Book reset successfully",
      });

      queryClient.invalidateQueries(["books"]);
      navigate("/books");
    },
    onError: (error) => {
      console.error("Error resetting book:", error);
      triggerNotification({
        type: "error",
        message: "Error",
        description: error?.response?.data?.message || "Failed to reset book",
      });
    },
  });

  if (isLoading) return <Loader />;

  if (isError) {
    const errorDescription = error?.response?.data?.message || error?.message;

    return (
      <ErrorPage description={errorDescription} onRetry={() => refetch()} />
    );
  }

  const handleFinish = (values) => {
    if (bookData?.book?.progress?.status === "not-started") {
      modal.confirm({
        title: "Note",
        content:
          "You cannot edit the number of pages once you start reading. Do you want to proceed?",
        okText: "Yes, Start Reading",
        cancelText: "Cancel",
        onOk: () => proceedWithUpdate(values),
      });
      return;
    }

    proceedWithUpdate(values);
  };

  const proceedWithUpdate = (values) => {
    let pagesReadToday = 0;

    if (bookData?.book?.progress?.pagesRead !== values.currentPage) {
      pagesReadToday = values.pagesReadToday;
    }

    updateProgress({
      bookId,
      pagesReadToday,
      currentPage: values.currentPage,
      rating: values.rating,
    });
  };

  const handleReadAgain = () => {
    mutate(bookId);
  };

  return (
    <div className="px-6 py-3">
      <div className="my-4">
        <span>
          <button className="focus:outline-none hover:text-[#FFA500]">
            <LeftOutlined className="w-8 h-8" onClick={() => navigate(-1)} />
          </button>
        </span>
        <span className="text-[16px] font-semibold leading-[24px] text-left">
          View Book
        </span>
      </div>

      <Row gutter={[24, 24]}>
        {/* Book Image */}
        <Col xs={24} md={10}>
          <div className="relative">
            <img
              src={bookData.book?.imageUrl}
              alt={bookData.book?.title}
              className="w-full h-[550px] rounded-lg object-cover cursor-pointer"
              onClick={() => {
                const img = new Image();
                img.src = bookData.book?.imageUrl;
                img.alt = bookData.book?.title;

                // Open a new window to display the image
                const viewer = window.open(
                  "",
                  "image-viewer",
                  "width=800,height=600"
                );
                viewer.document.write(
                  "<html><head><title>Image Viewer</title></head><body style='margin: 0; padding: 0; text-align: center; background-color: #f5f5f5;'><img src='" +
                    img.src +
                    "' alt='" +
                    img.alt +
                    "' style='max-width: 100%; height: auto; margin-top: 20px;' /></body></html>"
                );
                viewer.document.close();
              }}
            />
          </div>
        </Col>

        {/* Book Details */}
        <Col xs={24} md={14}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              ...bookData?.book,
              currentPage: bookData?.book?.progress?.currentPage,
              pagesReadToday: bookData?.book?.progress?.pagesReadToday,
            }}
            onFinish={handleFinish}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Title" name="title">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Author" name="author">
                <Input disabled />
              </Form.Item>

              <Form.Item label="Total Pages" name="numberOfPages">
                <InputNumber className="w-full" disabled />
              </Form.Item>

              <Form.Item label="Pages Read" name={["progress", "pagesRead"]}>
                <InputNumber className="w-full" disabled />
              </Form.Item>

              <Form.Item label="Last Read At">
                <Input
                  disabled
                  value={
                    bookData?.book?.progress?.lastReadAt
                      ? new Date(
                          bookData?.book?.progress?.lastReadAt
                        ).toLocaleString()
                      : "Not Read Yet"
                  }
                />
              </Form.Item>

              <Form.Item label="Finished">
                <Input
                  value={bookData?.book?.progress?.finished ? "Yes" : "No"}
                  disabled
                />
              </Form.Item>

              <Form.Item label="Times Read" name={["progress", "timesRead"]}>
                <InputNumber className="w-full" disabled />
              </Form.Item>

              <Form.Item label="Current Page" name="currentPage">
                <InputNumber
                  value={currentPage}
                  onChange={(value) => {
                    setCurrentPage(value);
                    setPagesReadToday(
                      value - bookData?.book?.progress?.currentPage
                    );

                    form.setFieldsValue({
                      currentPage: value,
                      pagesReadToday:
                        value - bookData?.book?.progress?.currentPage,
                    });
                  }}
                  className="w-full"
                  disabled={bookData?.book?.progress?.finished}
                />
              </Form.Item>

              <Form.Item label="Pages Read Recently" name="pagesReadToday">
                <InputNumber
                  value={pagesReadToday}
                  className="w-full"
                  readOnly
                />
              </Form.Item>

              <Form.Item label="Rating" name="rating">
                <Rate allowHalf />
              </Form.Item>
            </div>
            <Form.Item>
              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  className="py-1.5 w-full h-full shadow-none text-base"
                  type="primary"
                  htmlType="submit"
                  disabled={isPending}
                  loading={isUpdating}
                >
                  Update
                </Button>
                <Button
                  className="py-1.5 w-full h-full shadow-none text-base"
                  type="default"
                  htmlType="button"
                  disabled={!bookData?.book?.progress?.finished || isUpdating}
                  onClick={handleReadAgain}
                  loading={isPending}
                >
                  Re-read
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ViewBook;
