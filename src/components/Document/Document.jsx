import React, { useState, useRef, useContext } from "react";
import "./Document.css";
import { ImageConfig } from "../../components/config/imgConfig";
import uploadImg from "../../assets/upload.png";
import PropTypes from "prop-types";
import { FileContext } from "../FileContext/FileContext";


function Document(props) {
  const [documentName, setDocumentName] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [department, setDepartment] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [filesList, setFilesList] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { addFiles } = useContext(FileContext); // ใช้งาน Context

  const wrapperRef = useRef(null);
  const allowedFileTypes = ["application/pdf", "image/png", "application/zip"];
  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  const validateFile = (file) => {
    if (!allowedFileTypes.includes(file.type)) {
      setErrorMessage("ประเภทไฟล์ไม่รองรับ (รองรับเฉพาะ PDF, PNG, ZIP)");
      return false;
    }
    if (file.size > maxFileSize) {
      setErrorMessage("ไฟล์ขนาดใหญ่เกินไป (ต้องไม่เกิน 5 MB)");
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(validateFile);

    if (validFiles.length) {
      const updatedList = [
        ...filesList,
        ...validFiles.map((file) => ({
          file,
          uploadTime: new Date().toLocaleString(), // เพิ่มวันที่และเวลาที่อัปโหลด
        })),
      ];
      setFilesList(updatedList);
      addFiles(validFiles); // เพิ่มไฟล์ไปยัง Context
      setErrorMessage("");
    }

    if (validFiles.length < newFiles.length) {
      setErrorMessage("บางไฟล์ถูกปฏิเสธเนื่องจากไม่ผ่านเกณฑ์");
    }

    setUploadSuccess(false);
  };

  const resetForm = () => {
    setDocumentName("");
    setFiscalYear("");
    setDocumentNumber("");
    setDocumentType("");
    setDepartment("");
    setHashtag("");
    setAdditionalNotes("");
    setFilesList([]);
    setUploadSuccess(false);
    setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filesList.length === 0) {
      setErrorMessage("กรุณาเลือกไฟล์ก่อนส่ง");
      return;
    }

    const documentData = {
      documentName,
      fiscalYear,
      documentNumber,
      documentType,
      department,
      hashtag,
      additionalNotes,
      files: filesList.map((item) => ({
        name: item.file.name,
        size: item.file.size,
        type: item.file.type,
        uploadTime: item.uploadTime, // เพิ่มเวลาที่อัปโหลด
      })),
    };

    console.log(documentData);
    alert("บันทึกสำเร็จ!");
    setUploadSuccess(true);
    resetForm();
  };


  const onDragEnter = () => wrapperRef.current.classList.add("dragover");
  const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
  const onDrop = () => wrapperRef.current.classList.remove("dragover");

  const fileRemove = (fileToRemove) => {
    if (window.confirm(`คุณต้องการลบไฟล์ "${fileToRemove.name}" หรือไม่?`)) {
      const updatedList = filesList.filter((item) => item !== fileToRemove);
      setFilesList(updatedList);
      props.onFileChange?.(updatedList);
    }
  };

  return (
    <div className="upload-page-container">
      <h2 className="upload-page-title">อัปโหลดเอกสาร</h2>

      <div className="upload-content">
        {/* Left Section: Input Form */}
        <div className="upload-form-container">
          <form onSubmit={handleSubmit} className="upload-form">
            <label>
              ชื่อเอกสาร <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="กรอกชื่อเอกสาร"
              required
            />

            <label>
              เลขเอกสาร <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="xxxxxxxx"
              min={1}
              required
            />

            <label>
              ปีงบประมาณ <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              required
            >
              <option value="">เลือก</option>
              <option value="2565">2565</option>
              <option value="2566">2566</option>
              <option value="2567">2567</option>
            </select>

            <label>
              ประเภทเอกสาร <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            >
              <option value="">เลือกประเภทเอกสาร</option>
              <option value="ผลการดำเนินงาน">ผลการดำเนินงาน</option>
              <option value="รายงานประจำปี">รายงานประจำปี</option>
              <option value="รายงานปริมาณการผลิตรายเดือน">
                รายงานปริมาณการผลิตรายเดือน
              </option>
              <option value="การขาย มูลค่า และค่าภาคหลวง">
                การขาย มูลค่า และค่าภาคหลวง
              </option>
              <option value="การจัดสรรค่าภาคหลวงให้ท้องถิ่น">
                การจัดสรรค่าภาคหลวงให้ท้องถิ่น
              </option>
              <option value="การจัดหาปิโตรเลียม">การจัดหาปิโตรเลียม</option>
              <option value="ปริมาณสำรองปิโตรเลียม">
                ปริมาณสำรองปิโตรเลียม
              </option>
            </select>

            <label>
              หน่วยงาน <span style={{ color: "red" }}>*</span>
            </label>
            <select
             
            >
              <option value="กรมเชื้อเพลิงธรรมชาติ">กรมเชื้อเพลิงธรรมชาติ</option>
            
            </select>

            <label>คำเกี่ยวข้อง # (hashtag)</label>
            <input
              type="text"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
            />

            <label>คำอธิบายเพิ่มเติม</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              ></textarea> <br />
              
            <button type="submit" className="btn btn-success">
              บันทึก 
            </button>
            {errorMessage && <span className="error-message">{errorMessage}</span>}
            
          </form>
        </div>

        {/* Right Section: File Upload */}
        <div className="upload-file-container">
          <div
            ref={wrapperRef}
            className="drop-file-input"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="drop-file-input__label">
              <img src={uploadImg} alt="upload" />
              <p>Drag and drop your files here</p>
            </div>
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          {filesList.length > 0 ? (
            <div className="drop-file-preview">
              <p className="drop-file-preview__title">Ready to Upload</p>
              {filesList.map((item, index) => (
                <div key={index} className="drop-file-preview__item">
                  <img
                    src={ImageConfig[item.file.type.split("/")[1]] || ImageConfig["default"]}
                    alt={item.file.name}
                  />
                  <div className="drop-file-preview__item__info">
                    <p>{item.file.name}</p>
                    <p>{(item.file.size / 1024).toFixed(2)} KB</p>
                    <p>อัปโหลดเมื่อ: {item.uploadTime}</p> {/* แสดงวันที่และเวลา */}
                  </div>
                  <span
                    className="drop-file-preview__item__del"
                    onClick={() => fileRemove(item)}
                  >
                    x
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>

  );
}


Document.propTypes = {
  onFileChange: PropTypes.func,
};

export default Document;
