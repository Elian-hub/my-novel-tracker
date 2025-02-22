import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme, App as AntdApp, notification } from "antd";
import {
  getSessionData,
  logoutUser,
  queryClient,
} from "./utils/localStorageService";
import AppRoutes from "./shared/AppRoutes.jsx";
import { useEffect, useRef } from "react";
import { FormDataProvider } from "./store/FormDataContext";
import { useTheme } from "./store/context";
import { NotificationProvider } from "./store/NotificationContext.jsx";

function App() {
  const { theme: selectedTheme } = useTheme();
  const lightTheme = selectedTheme === "light";

  // const sessionData = getSessionData();
  // const isLoggedIn = !!sessionData;

  // const idleTimeoutRef = useRef(null);
  // const logoutTimeRef = useRef(null);

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     return;
  //   }

  //   const handleUserActivity = () => {
  //     if (idleTimeoutRef.current) {
  //       clearTimeout(idleTimeoutRef.current);
  //     }
  //     if (logoutTimeRef.current) {
  //       clearTimeout(logoutTimeRef.current);
  //     }

  //     idleTimeoutRef.current = setTimeout(() => {
  //       notification.warning({
  //         message: "Inactivity Alert",
  //         description:
  //           "You have been inactive for 30 seconds. You will be logged out in the next 30 seconds if there is no further activity.",
  //         duration: 30,
  //         key: "idle-warning",
  //       });

  //       logoutTimeRef.current = setTimeout(async () => {
  //         notification.destroy("idle-warning");
  //         await logoutUser();
  //         notification.success({
  //           message: "Session Expired",
  //           description: "You have been logged out due to inactivity.",
  //           duration: 3,
  //         });
  //         window.location.href = "/auth/login";
  //       }, 30000);
  //     }, 30000);
  //   };

  //   handleUserActivity();

  //   const events = [
  //     "mousemove",
  //     "mousedown",
  //     "keydown",
  //     "scroll",
  //     "touchstart",
  //   ];

  //   events.forEach((event) =>
  //     window.addEventListener(event, handleUserActivity)
  //   );

  //   return () => {
  //     events.forEach((event) =>
  //       window.removeEventListener(event, handleUserActivity)
  //     );
  //     if (idleTimeoutRef.current) {
  //       clearTimeout(idleTimeoutRef.current);
  //     }
  //     if (logoutTimeRef.current) {
  //       clearTimeout(logoutTimeRef.current);
  //     }
  //     notification.destroy();
  //   };
  // }, [isLoggedIn]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FFA500",
        },
        algorithm: lightTheme ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AntdApp>
          <NotificationProvider>
            <FormDataProvider>
              <AppRoutes />
            </FormDataProvider>
          </NotificationProvider>
        </AntdApp>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
