import { useState, useMemo } from "react";
import { FormDataContext } from "./context";

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({});

  const value = useMemo(() => ({ formData, setFormData }), [formData]);

  return (
    <FormDataContext.Provider value={value}>
      {children}
    </FormDataContext.Provider>
  );
};
