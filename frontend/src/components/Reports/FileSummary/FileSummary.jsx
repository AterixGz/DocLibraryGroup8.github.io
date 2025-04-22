import React, { useEffect, useState } from "react";
import "./FileSummary.css";

function FileSummary() {
  const [fileSummary, setFileSummary] = useState([]);
  const [uploadsByUser, setUploadsByUser] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/approved-file-extensions-from-folder")
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

  return (
    <aside className="file-summary">
      <p className="title-filesummary">ประเภทไฟล์ที่อนุมัติแล้ว</p>
      <ul>
        {fileSummary.length ? (
          fileSummary.slice(0, 3).map((item) => (
            <li key={item.extension}>
              {item.extension}: {item.count} ฉบับ
            </li>
          ))
        ) : (
          <li>Loading...</li>
        )}
      </ul>
      <p className="title-filesummary">รายชื่อผู้ที่อัพโหลดมากที่สุด</p>
      <ul>
        {uploadsByUser.length ? (
          uploadsByUser
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((item, index) => (
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
