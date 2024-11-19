import React from "react";
import documents from "../../data/documents"; // นำเข้าข้อมูลจาก documents.js
import "./MyDocument.css";

const MyDocument = () => {
  return (
    <div className="my-document-container">
      <h2 className="my-document-title">My Document</h2>

      {/* Filter Section */}
      <div className="filter-section">
        <button className="filter-button">ประเภท</button>
        <button className="filter-button">แก้ไขเมื่อ</button>
        <button className="filter-button">หน่วยงาน</button>
      </div>

      {/* Document Table */}
      <table className="document-table">
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>ประเภท</th>
            <th>หน่วยงาน</th>
            <th>ผู้บันทึก</th>
            <th>แก้ไขล่าสุด</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="document-name">
                <img src={doc.icon} alt="File Icon" className="file-icon" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
              </td>
              <td>{doc.type}</td>
              <td>{doc.department}</td>
              <td>{doc.uploader}</td>
              <td>{new Date(doc.date).toLocaleDateString("th-TH")}</td>
              <td>
                <button className="more-options">⋮</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyDocument;
