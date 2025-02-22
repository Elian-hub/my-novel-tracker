import { createContext, useContext } from "react";

// FormData context
export const FormDataContext = createContext({
  formData: { registrationAttachment: [], copAttachment: [] },
  setFormData: () => {},
});

export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error("useFormData must be used within a FormDataProvider");
  }
  return context;
};

// Theme Context
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// Notification context
export const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);
