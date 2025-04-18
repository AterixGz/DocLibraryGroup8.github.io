import React, { useEffect, useState } from "react";
import "./FileSummary.css";

function FileSummary() {
  const [fileSummary, setFileSummary] = useState({});
  const [uploadsByUser, setUploadsByUser] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/uploads-summary")
      .then((response) => response.json())
      .then((data) => setFileSummary(data))
      .catch((err) => console.error("Error fetching file summary:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/uploads-by-user")
      .then((response) => response.json())
      .then((data) => setUploadsByUser(data))
      .catch((err) => console.error("Error fetching uploads by user:", err));
  }, []);

  // เรียงลำดับ uploadsByUser โดยให้อันดับสูงสุดอยู่บนสุด
  const sortedUploadsByUser = uploadsByUser.length
    ? [...uploadsByUser].sort((a, b) => b.count - a.count)
    : [];

  return (
    <aside className="file-summary">
      <p className="title-filesummary">ประเภทไฟล์</p>
      <ul>
        {Object.keys(fileSummary).length ? (
          Object.keys(fileSummary).map((ext) => (
            <li key={ext}>
              {ext}: {fileSummary[ext]} ฉบับ
            </li>
          ))
        ) : (
          <li>Loading...</li>
        )}
      </ul>
      <p className="title-filesummary">อัพโหลดไฟล์ (30 วันที่ผ่านมา)</p>
      <ul>
        {sortedUploadsByUser.length ? (
          sortedUploadsByUser.map((item, index) => (
            <li key={index}>
              {item.uploader}: {item.count} ฉบับ
            </li>
          ))
        ) : (
          <li>Loading...</li>
        )}
      </ul>
    </aside>
  );
}

export default FileSummary;