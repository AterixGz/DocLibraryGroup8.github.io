import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './LatestFiles.css';

function LatestFiles({ title }) {
  const [latestFiles, setLatestFiles] = useState([]);
  const [allCount, setAllCount] = useState(0);

  useEffect(() => {
    const fetchLatestFiles = async () => {
      try {
        let endpoint = 'http://localhost:3000/api/files/latest';
        // ถ้า title คือ "ไฟล์ที่ลบล่าสุด" ให้ดึงจาก trash endpoint และใช้ deleted_at สำหรับการเรียงลำดับ
        if (title === "ไฟล์ที่ลบล่าสุด") {
          const userData = localStorage.getItem("userData")
            ? JSON.parse(localStorage.getItem("userData")).id
            : null;
          if (!userData) {
            throw new Error("User not authenticated");
          }
          endpoint = `http://localhost:3000/api/files/trash?userId=${userData}`;
        }
  
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let data = await response.json();
        setAllCount(data.length); // เก็บจำนวนไฟล์ทั้งหมดก่อน slice
        if (title === "ไฟล์ที่ลบล่าสุด") {
          // เรียงลำดับโดยใช้ deleted_at และเลือกเพียง 3 รายการล่าสุด
          data = data.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at)).slice(0, 3);
        } else {
          data = data.slice(0, 3);
        }
        setLatestFiles(data);
      } catch (error) {
        console.error('Error fetching latest files:', error);
      }
    };
  
    fetchLatestFiles();
  }, [title]);
  
  // ฟังก์ชันแปลงรูปแบบวันที่: ใช้ deleted_at ถ้าเป็นไฟล์ที่ลบล่าสุด
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${hours}:${minutes} น. ${day}/${month}/${year}`;
  };
  
  // ตั้งค่า Link ที่จะนำไปสู่หน้าแสดงข้อมูลเพิ่มเติม (ไม่เปลี่ยนแปลง)
  const LinktoThis = title === "ไฟล์ที่เพิ่มล่าสุด" ? "/reports/addfilelist" : "/reports/removefilelist";
  
  return (
    <section className="latest-files">
      <h3 className='latest-files-title'>{title}</h3>
      <table className='width100'>
        <thead>
          <tr>
            <th>หน่วยงาน</th>
            <th>ชื่อเอกสาร</th>
            <th>{title === "ไฟล์ที่ลบล่าสุด" ? "ลบล่าสุด" : "อัพโหลดล่าสุด"}</th>
          </tr>
        </thead>
        <tbody>
          {latestFiles.length === 0 && title === "ไฟล์ที่ลบล่าสุด" ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>
                ตอนนี้ไม่มีไฟล์ที่กำลังลบอยู่
              </td>
            </tr>
          ) : (
            latestFiles.map((file) => (
              <tr className='border-bottom-document-report' id='list-report-latestfiles' key={file.id}>
                <td>{file.department}</td>
                <td>{file.name}</td>
                <td>{formatDate(title === "ไฟล์ที่ลบล่าสุด" ? file.deleted_at : file.uploaded_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* แสดงปุ่มดูเพิ่มเติมเฉพาะเมื่อมีไฟล์มากกว่า 3 ไฟล์ */}
      {allCount > 3 && (
        <Link to={LinktoThis}>
          <button className='button-see-more'>ดูเพิ่มเติม</button>
        </Link>
      )}
    </section>
  );
}

export default LatestFiles;