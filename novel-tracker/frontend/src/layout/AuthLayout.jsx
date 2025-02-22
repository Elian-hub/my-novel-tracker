import { useEffect, useState } from "react";
import bgImage from "../assets/bgImage.jpeg";
import { useTheme } from "../store/context";

const AuthLayout = ({ children }) => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {!collapsed && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            width: "100%",
            background: theme === "dark" ? "#2f2f2f" : "#f0f2f5",
          }}
        >
          <div
            style={{
              maxWidth: "1500px",
              width: "100%",
              height: "100%", // Adjust height based on aspect ratio
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div
              className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 h-full overflow-y-auto"
              style={{ backgroundImage: `url(${bgImage})` }}
            >
              <div
                className={
                  theme === "dark"
                    ? "bg-black bg-opacity-90 p-8 rounded-lg shadow-md w-full max-w-lg"
                    : "bg-white bg-opacity-90 p-8 rounded-lg shadow-md w-full max-w-lg"
                }
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div
          className={`min-h-screen flex items-center justify-center p-2 ${
            theme === "dark" ? "bg-black" : ""
          }`}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default AuthLayout;
