import { useCallback } from "react";
import { App } from "antd";
import { NotificationContext } from "./context";

export const NotificationProvider = ({ children }) => {
  const { notification } = App.useApp();

  const triggerNotification = useCallback(
    ({ type, message, description }) => {
      notification[type]({
        message,
        description,
      });
    },
    [notification]
  );

  return (
    <NotificationContext.Provider value={triggerNotification}>
      {children}
    </NotificationContext.Provider>
  );
};
