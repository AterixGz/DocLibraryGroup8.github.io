import React, { useEffect, useState } from "react";
import "./TableSection.css";

function TableSection() {
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:3000/api/files")
      .then((response) => response.json())
      .then((files) => {
        // Group files by department
        const groups = {};
        files.forEach((file) => {
          const dept = file.department || "ไม่ระบุ";
          if (groups[dept]) {
            groups[dept].count += 1;
            const fileDate = new Date(file.uploaded_at);
            const currentLast = new Date(groups[dept].lastUpload);
            if (fileDate > currentLast) {
              groups[dept].lastUpload = file.uploaded_at;
            }
          } else {
            groups[dept] = {
              count: 1,
              lastUpload: file.uploaded_at,
            };
          }
        });
        // Convert grouped object to array and sort by count descending
        const deptsArr = Object.keys(groups)
          .map((dept) => ({
            department: dept,
            count: groups[dept].count,
            lastUpload: groups[dept].lastUpload,
          }))
          .sort((a, b) => b.count - a.count);
        setDepartments(deptsArr);
      })
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  // ฟังก์ชั่นสำหรับจัดรูปแบบวันที่
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH");
  };

  // Pagination calculations
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDepartments = departments.slice(startIndex, startIndex + itemsPerPage);

  // Pagination event handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  const goToNextPage = () =>
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <section className="table-section">
      <h3 id="title-report-table">หน่วยงาน</h3>
      <table id="table-report">
        <thead>
          <tr>
            <th>หน่วยงาน</th>
            <th>จำนวนเอกสาร</th>
            <th>อัพโหลดล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {displayedDepartments.length ? (
            displayedDepartments.map((item, index) => (
              <tr key={index} className="border-bottom-document-report">
                <td style={{ textAlign: "left" }}>{item.department}</td>
                <td>{item.count} ฉบับ</td>
                <td>{formatDate(item.lastUpload)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Loading...</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination-report">
        <button
          className="pagination-button-report"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
        >
          หน้าแรก
        </button>
        <button
          className="pagination-button-report"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        <span id="span-pagination">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          className="pagination-button-report"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          ต่อไป
        </button>
        <button
          className="pagination-button-report"
          onClick={goToLastPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          สิ้นสุด
        </button>
      </div>
    </section>
  );
}

export default TableSection;  