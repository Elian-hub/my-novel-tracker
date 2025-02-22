import { Layout, Card, Button } from "antd";
import { motion } from "framer-motion";
import LottieAnimation from "./LottiePlayer";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../store/context";

const { Header, Content, Footer } = Layout;

const HomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

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
        <Layout className="bg-gray-100 min-h-[100vh] h-full">
          <Content>
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-gradient-to-br from-orange-400 to-orange-900 text-white">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-4 text-center">
                  Track Your Reading Journey Effortlessly
                </h1>
                <p className="text-lg mb-6 text-center">
                  Organize your novels, monitor your daily reading progress, and
                  achieve your literary goals with ease.
                </p>
                <p className="text-center">
                  <Button
                    type="primary"
                    size="large"
                    className="bg-white text-blue-500 shadow-none"
                    onClick={() => {
                      navigate("/auth/login");
                    }}
                  >
                    Start Tracking Now
                  </Button>
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:ml-8">
                <LottieAnimation
                  animation="/books.lottie"
                  width="80px"
                  height="80px"
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="py-16 px-8">
              <h2 className={`text-3xl font-bold text-center mb-12 text-black`}>
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card
                  className="shadow-lg"
                  cover={
                    <LottieAnimation
                      animation="/track.lottie"
                      width="40px"
                      height="40px"
                    />
                  }
                >
                  <Card.Meta
                    title="Track Your Daily Reading"
                    description="Log the number of pages you read each day and visualize your progress."
                  />
                </Card>
                <Card
                  className="shadow-lg"
                  cover={
                    <LottieAnimation
                      animation="/stats.lottie"
                      width="40px"
                      height="40px"
                    />
                  }
                >
                  <Card.Meta
                    title="View Reading Stats"
                    description="Analyze your reading trends and set goals to stay motivated."
                  />
                </Card>
                <Card
                  className="shadow-lg"
                  cover={
                    <LottieAnimation
                      animation="/library.lottie"
                      width="40px"
                      height="40px"
                    />
                  }
                >
                  <Card.Meta
                    title="Organize Your Library"
                    description="Add books, along with their details, and manage your reading list."
                  />
                </Card>
              </div>
            </div>
          </Content>

          {/* Footer */}
          <Footer className="bg-gradient-to-br from-gray-700 to-gray-400 text-white text-center">
            <p>
              &copy; {new Date().getFullYear()} Reading Tracker. All rights
              reserved.
            </p>
          </Footer>
        </Layout>
      </div>
    </div>
  );
};

export default HomePage;
