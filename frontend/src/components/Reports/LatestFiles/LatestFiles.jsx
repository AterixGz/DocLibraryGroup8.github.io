import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './LatestFiles.css';

function LatestFiles({ title }) {
  const [latestFiles, setLatestFiles] = useState([]);
  const LinktoThis = title === "ไฟล์ที่เพิ่มล่าสุด" ? "/reports/addfilelist" : "/reports/removefilelist";

  useEffect(() => {
    const fetchLatestFiles = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/files/latest');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setLatestFiles(data);
      } catch (error) {
        console.error('Error fetching latest files:', error);
      }
    };

    fetchLatestFiles();
  }, []);

  // แปลงรูปแบบวันที่
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

    return `${hours}:${minutes} น. ${day}/${month}/${year}`;
  };

  return (
    <section className="latest-files">
      <h3 className='latest-files-title'>{title}</h3>
      <table className='width100'>
        <thead>
          <tr>
            <th>หน่วยงาน</th>
            <th>ชื่อเอกสาร</th>
            <th>อัพโหลดล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {latestFiles.map((file) => (
            <tr className='border-bottom-document-report' id='list-report-latestfiles' key={file.id}>
              <td>{file.department}</td>
              <td>{file.filename}</td>
              <td>{formatDate(file.uploaded_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to={LinktoThis}>
        <button className='button-see-more'>ดูเพิ่มเติม</button>
      </Link>
    </section>
  );
}

export default LatestFiles;