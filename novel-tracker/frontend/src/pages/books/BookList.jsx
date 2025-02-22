import { App, Table, Button, Card, Descriptions, Tooltip, Space } from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
import { useNotification, useTheme } from "../../store/context";
import ErrorPage from "../../shared/ErrorPage";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../utils/localStorageService";
import StatusTag from "../../components/books/StatusTag";
import RatingTag from "../../components/books/RatingTag";

const getBooks = async () => {
  const response = await axiosInstance.get("/api/books/all");
  return response.data;
};

const deleteBook = async (id) => {
  const bookId = id;
  const response = await axiosInstance.delete(`/api/books/delete/${bookId}`);
  return response.data;
};

const BookList = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { modal } = App.useApp();
  const triggerNotification = useNotification();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
    keepPreviousData: true,
  });

  // Delete book using React Query
  const { mutate, isPending } = useMutation({
    queryKey: ["deleteBook"],
    mutationFn: deleteBook,
    onSuccess: (data) => {
      triggerNotification({
        type: "success",
        message: "Success",
        description: data?.message || "Book deleted successfully",
      });

      queryClient.invalidateQueries(["books"]);
    },
    onError: (error) => {
      console.error("Error deleting book:", error);
      triggerNotification({
        type: "error",
        message: "Error",
        description: error?.response?.data?.message || "Failed to delete book",
      });
    },
  });

  const handleDelete = (id) => {
    modal.confirm({
      title: "Are you sure delete this book?",
      content:
        "This action cannot be undone and will permanently delete the book and all its records.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      onOk: () => {
        mutate(id);
      },
    });
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => {
        return <RatingTag rating={rating} />;
      },
    },
    {
      title: "Reading Status",
      dataIndex: ["progress", "status"],
      key: "progress.status",
      render: (status) => {
        return <StatusTag status={status} />;
      },
    },
    {
      title: "Number of Pages",
      dataIndex: "numberOfPages",
      key: "numberOfPages",
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Book">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/books/edit/${record._id}`)}
              // disabled={record?.progress?.status !== "not-started"}
            />
          </Tooltip>
          <Tooltip title="View Book">
            <Button
              type="link"
              icon={
                <EyeOutlined className="text-yellow-400 hover:text-yellow-600" />
              }
              onClick={() => navigate(`/books/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete Book">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const expandable = {
    expandedRowRender: (record) => (
      <div className="w-[100vw] md:w-[70vw]">
        <Descriptions
          title="Book Details"
          bordered
          column={1}
          size="small"
          styles={{ label: { fontWeight: 600 } }}
        >
          <Descriptions.Item label="Title">{record.title}</Descriptions.Item>
          <Descriptions.Item label="Author">{record.author}</Descriptions.Item>
          <Descriptions.Item label="Description">
            {record.description}
          </Descriptions.Item>
          <Descriptions.Item label="Number of Pages">
            {record.numberOfPages}
          </Descriptions.Item>
          <Descriptions.Item label="Current Page">
            {record.progress.currentPage}
          </Descriptions.Item>
          <Descriptions.Item label="Times Read">
            {record.progress.timesRead}
          </Descriptions.Item>
          <Descriptions.Item label="Rating">
            <RatingTag rating={record.rating} />
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag status={record.progress.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Added At">
            {new Date(record.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(record.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </div>
    ),
    expandIcon: ({ expanded, onExpand, record }) =>
      expanded ? (
        <MinusOutlined
          style={{ color: "#A32A29" }}
          onClick={(e) => onExpand(record, e)}
        />
      ) : (
        <PlusOutlined
          style={{ color: "#A32A29" }}
          onClick={(e) => onExpand(record, e)}
        />
      ),
  };

  if (isError) {
    return (
      <ErrorPage
        description={
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong! Please try again later."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="p-6">
      <div
        className={`p-6 ${
          theme === "light" ? "bg-white" : "bg-stone-950"
        } shadow-md rounded-lg w-full mb-3`}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm md:text-xl font-semibold mb-4">Add a Book</p>
          <Button
            type="primary"
            className="mb-4 w-auto shadow-none"
            onClick={() => navigate("/books/add")}
            icon={<PlusOutlined />}
          >
            Add Book
          </Button>
        </div>
        <p className="text-gray-500 mb-6">
          To add a book, click the &quot;Add Book&quot; button above.
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.books}
          loading={isLoading || isPending}
          rowKey="_id"
          expandable={expandable}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default BookList;
