// src/context/FileContext.jsx
import React, { createContext, useState } from "react";

export const FileContext = createContext();

const FileProvider = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const addFiles = (newFiles) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (fileToRemove) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  return (
    <FileContext.Provider value={{ uploadedFiles, addFiles, removeFile }}>
      {children}
    </FileContext.Provider>
  );
};

export default FileProvider;
