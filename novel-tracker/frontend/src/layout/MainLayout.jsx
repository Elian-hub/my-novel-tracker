import React, { useCallback, useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer, Modal, Dropdown, Avatar } from "antd";
import { MenuOutlined, MoreOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSessionData, logoutUser } from "../utils/localStorageService";
import { useNotification, useTheme } from "../store/context";
import { MoonIcon, SunIcon } from "../utils/Icons";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSessionData();
  const { theme, toggleTheme } = useTheme();
  const triggerNotification = useNotification();

  const [currentKey, setCurrentKey] = useState(
    localStorage.getItem("currentMenuKey") || "profile"
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    triggerNotification({
      type: "success",
      message: "Logout Success",
      description: "User logged out successfully!",
    });

    navigate("/", { replace: true });
  }, [navigate]);

  const handleViewProfileImage = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    if (!session?.email) {
      // If no valid session, log out and redirect
      handleLogout();
    }
  }, [session, handleLogout]);

  useEffect(() => {
    const pathToKey = {
      "/dashboard": "dashboard",
      "/profile": "profile",
      "/books": "books",
    };

    const baseRoute = Object.keys(pathToKey)
      .sort((a, b) => b.length - a.length) // Sort paths by length, longest first
      .find((path) => location.pathname.startsWith(path)); // Find the first match

    const matchedKey = pathToKey[baseRoute];
    setCurrentKey(matchedKey);
    localStorage.setItem("currentMenuKey", matchedKey);
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const items = [
    {
      key: "dashboard",
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "books",
      label: <Link to="/books">Books</Link>,
    },
    {
      key: "profile",
      label: <Link to="/profile">Profile</Link>,
    },
  ];

  // Split items into visible and extra
  const visibleItems = items.slice(0, 5); // First four items
  const extraItems = items.slice(5); // Remaining items

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Ensure full height
        height: "100%",
        width: "100%", // Take full width
        background: theme === "dark" ? "#2f2f2f" : "#e5e5e5", // Optional background color for contrast
      }}
    >
      <div
        style={{
          maxWidth: "1400px", // Limit layout width
          width: "100%", // Responsive width
          height: "100%", // Ensure full height
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Optional shadow
          overflow: "auto",
        }}
      >
        <Modal
          title={session?.name}
          open={isModalOpen}
          onOk={closeModal}
          onCancel={closeModal}
          footer={null}
        >
          <img
            src={session?.imageUrl}
            alt={session?.name}
            className="w-full h-auto rounded-md"
          />
        </Modal>

        <Layout className="min-h-screen w-full">
          {/* Navbar */}
          <Header
            className={`${
              theme === "dark" ? "bg-stone-900" : "bg-white"
            } flex justify-between items-center gap-6 shadow-md px-6 w-full`}
          >
            {/* Left: Logo and Monitor Name */}

            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
              onClick={handleViewProfileImage}
            >
              <Avatar
                size={50}
                icon={<UserOutlined />}
                src={session?.imageUrl}
              />
              <span className="truncate text-sm font-medium max-w-[150px] overflow-hidden whitespace-nowrap">
                {session?.name}
              </span>
            </div>

            {/* Middle: Responsive Navigation */}
            {!isMobile && (
              <div className="flex items-center space-x-4 w-full">
                <Menu
                  mode="horizontal"
                  className="flex-grow justify-center border-none"
                  selectedKeys={[currentKey]}
                  items={items}
                />
                <Button type="text" onClick={toggleTheme}>
                  {theme === "light" ? <SunIcon /> : <MoonIcon />}
                </Button>
                {/* Dropdown for extra items */}
                {/* {extraItems.length > 0 && (
                  <Dropdown
                    menu={{
                      items: extraItems.map(({ key, label }) => ({
                        key,
                        label,
                        className: currentKey === key ? "highlighted" : "",
                      })),
                    }}
                    placement="bottomRight"
                  >
                    <span
                      style={{
                        cursor: "pointer",
                        padding: "0 12px",
                        lineHeight: "40px",
                        display: "inline-block",
                      }}
                    >
                      <MoreOutlined />
                    </span>
                  </Dropdown>
                )} */}
              </div>
            )}

            {/* Hamburger Menu for Small Screens */}
            <Button
              type="text"
              className="md:hidden"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />

            {/* Right: Logout Button */}
            <Button
              type="primary"
              className="hidden md:flex shadow-none"
              danger
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Header>

          {/* Drawer for Small Screens */}
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={"70vw"}
          >
            <Menu
              mode="vertical"
              selectedKeys={[currentKey]}
              items={items}
              onClick={() => setDrawerVisible(false)} // Close drawer after selection
            />

            <Button
              type="text"
              onClick={toggleTheme}
              className="mt-2 bg-transparent"
            >
              {theme === "light" ? <SunIcon /> : <MoonIcon />} Mode
            </Button>
            <Button
              type="primary"
              danger
              className="w-full mt-4"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Drawer>

          {/* Content Area */}
          <Content className="w-full">{children}</Content>

          {/* Footer */}
          <Footer
            className={`${
              theme === "dark" ? "bg-stone-900" : "bg-white"
            }  flex items-center justify-between gap-2 shadow-md py-4`}
          >
            <p>
              &copy; {new Date().getFullYear()} Novel Tracker. All Rights
              Reserved.
            </p>

            <p>
              Designed with <span style={{ color: "red" }}>&hearts;</span> by{" "}
              <Link
                to="https://github.com/mogakaowen"
                target="_blank"
                className="hover:text-orange-500"
              >
                Mogaka
              </Link>
            </p>
          </Footer>
        </Layout>
      </div>
    </div>
  );
};

export default MainLayout;
