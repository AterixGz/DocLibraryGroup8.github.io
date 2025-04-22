import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LatestFiles.css";

function LatestFiles({ title }) {
  const [latestFiles, setLatestFiles] = useState([]);
  const [allCount, setAllCount] = useState(0);

  // ตั้งค่า endpoint และคอลัมน์ตาม title
  useEffect(() => {
    const fetchLatestFiles = async () => {
      try {
        let endpoint = "http://localhost:3000/api/files/latest";
        let isRemove = false;
        if (title === "ไฟล์ที่ลบล่าสุด") {
          isRemove = true;
          const userData = localStorage.getItem("userData")
            ? JSON.parse(localStorage.getItem("userData")).id
            : null;
          if (!userData) {
            setLatestFiles([]);
            setAllCount(0);
            return;
          }
          endpoint = `http://localhost:3000/api/files/trash?userId=${userData}`;
        }
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Network response was not ok");
        let data = await response.json();
        setAllCount(data.length);
        if (isRemove) {
          data = data
            .sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))
            .slice(0, 3);
        } else {
          data = data.slice(0, 3);
        }
        setLatestFiles(data);
      } catch (error) {
        setLatestFiles([]);
        setAllCount(0);
        console.error("Error fetching latest files:", error);
      }
    };
    fetchLatestFiles();
  }, [title]);

  // ฟังก์ชันแปลงรูปแบบวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ][date.getMonth()];
    const year = date.getFullYear();
    return `${hours}:${minutes} น. ${day}/${month}/${year}`;
  };

  // ตั้งค่า Link ที่จะนำไปสู่หน้าแสดงข้อมูลเพิ่มเติม
  const LinktoThis =
  title === "ไฟล์ที่เพิ่มล่าสุด"
    ? "/reports/documentlist?mode=add"
    : "/reports/documentlist?mode=remove";

  return (
    <section className="latest-files">
      <h3 className="latest-files-title">{title}</h3>
      <table className="width100">
        <thead>
          <tr>
            <th>หน่วยงาน</th>
            <th>ชื่อเอกสาร</th>
            <th>
              {title === "ไฟล์ที่ลบล่าสุด" ? "ลบล่าสุด" : "อัพโหลดล่าสุด"}
            </th>
          </tr>
        </thead>
        <tbody>
          {latestFiles.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>
                {title === "ไฟล์ที่ลบล่าสุด"
                  ? "ตอนนี้ไม่มีไฟล์ที่กำลังลบอยู่"
                  : "ตอนนี้ไม่มีไฟล์ที่เพิ่มล่าสุดอยู่"}
              </td>
            </tr>
          ) : (
            latestFiles.map((file) => (
              <tr
                className="border-bottom-document-report"
                id="list-report-latestfiles"
                key={file.id}
              >
                <td>{file.department}</td>
                <td className="filename-ellipsis-filename">
                  {(file.name || file.filename).length > 30
                    ? (file.name || file.filename).slice(0, 30) + "..."
                    : file.name || file.filename}
                </td>
                <td>
                  {formatDate(
                    title === "ไฟล์ที่ลบล่าสุด"
                      ? file.deleted_at
                      : file.uploaded_at
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* {allCount > 3 && ( */}
        <Link to={LinktoThis}>
          <button className="button-see-more">ดูเพิ่มเติม</button>
        </Link>
      {/* )} */}
    </section>
  );
}

export default LatestFiles;
