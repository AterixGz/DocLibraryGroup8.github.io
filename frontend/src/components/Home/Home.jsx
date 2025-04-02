import React, { useState, useEffect, useContext } from "react";
import "./Home.css";
import { FileContext } from "../FileContext/FileContext";
import { motion as m } from "framer-motion";

const Home = ({ role }) => {
  const { uploadedFiles } = useContext(FileContext);
  const [documents, setDocuments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    documentName: "",
    date: "",
    category: "",
    department: "",
  });
  const [sortOption, setSortOption] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);
  const [isSingleDownload, setIsSingleDownload] = useState(false);
  const [downloadPopups, setDownloadPopups] = useState([]);

  // 🔄 โหลดไฟล์ทั้งหมดจาก backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/files");
        const data = await res.json();
        setDocuments([...data, ...uploadedFiles]); // Combine with files from context
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };
    fetchFiles();
  }, [uploadedFiles]);

  // 🔄 โหลดไฟล์ทั้งหมดจาก backend
  const sortDocuments = (docs, option, order) => {
    return docs.sort((a, b) => {
      if (option === "date") {
        const dateA = new Date(a.date || a.uploaded_at);
        const dateB = new Date(b.date || b.uploaded_at);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      } else if (option === "name") {
        return order === "asc"
          ? a.filename.localeCompare(b.filename)
          : b.filename.localeCompare(a.filename);
      } else if (option === "category") {
        return order === "asc"
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
  };

  const handleSortChange = (event) => {
    const [option, order] = event.target.value.split("-");
    setSortOption(event.target.value);
    setDocuments((prev) => sortDocuments([...prev], option, order));
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.trim().toLowerCase().replace(/&/g, "และ");
    setFilters((prev) => ({ ...prev, [name]: cleanedValue }));
    setCurrentPage(1);
  };

  const handlePreview = (fileUrl) => {
    if (fileUrl.endsWith(".xlsx")) {
      setAlertMessage("ไม่สามารถแสดงตัวอย่างไฟล์ Excel ได้ในขณะนี้");
    } else {
      setPreviewFile(fileUrl);
    }
  };

  const closeAlert = () => {
    setAlertMessage(null);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const toggleCheckbox = () => {
    setShowCheckbox((prev) => !prev);
    setSelectedDocuments([]); // Reset การเลือกเมื่อ toggle
    setIsDownloading(false); // Reset การดาวน์โหลด
    setIsDownloadComplete(false); // ซ่อน popup
  };

  const handleSelectDocument = (id) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentDocumentIds = currentDocuments.map((doc) => doc.id);

    if (currentDocumentIds.every((id) => selectedDocuments.includes(id))) {
      // ยกเลิกการเลือกทั้งหมดในหน้านั้น
      setSelectedDocuments((prev) =>
        prev.filter((id) => !currentDocumentIds.includes(id))
      );
    } else {
      // เลือกทั้งหมดในหน้านั้น
      setSelectedDocuments((prev) => [
        ...prev,
        ...currentDocumentIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSingleDownload = (fileUrl, fileName) => {
    setIsSingleDownload(true);

    const newPopup = {
      id: Date.now(),
      message: `ดาวน์โหลดเอกสารเสร็จสิ้น`,
      isSingle: true,
    };

    setDownloadPopups((prev) => [...prev, newPopup]);

    // ตั้งเวลาให้ popup หายไปหลัง 5 วินาที
    setTimeout(() => {
      setDownloadPopups((prev) =>
        prev.filter((popup) => popup.id !== newPopup.id)
      );
    }, 5000);

    // Trigger download
    filesToDownload.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.FileUrl;
      link.download = file.name;
      link.click();
    });
  };

  const handleDownloadSelected = () => {
    setIsSingleDownload(false);

    const filesToDownload = documents.filter((doc) =>
      selectedDocuments.includes(doc.id)
    );
    

    const newPopup = {
      id: Date.now(),
      message: `ดาวน์โหลดเอกสารทั้งหมด ${selectedDocuments.length} รายการเสร็จสิ้น`,
      isSingle: false,
    };

    setDownloadPopups((prev) => [...prev, newPopup]);

    // ตั้งเวลาให้ popup หายไปหลัง 5 วินาที
    setTimeout(() => {
      setDownloadPopups((prev) =>
        prev.filter((popup) => popup.id !== newPopup.id)
      );
    }, 5000);

    filesToDownload.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.FileUrl;
      link.download = file.name;
      link.click();
    });
  };

  // Function to close popup by ID
  const closeDownloadPopup = (id) => {
    setDownloadPopups((prev) => prev.filter((popup) => popup.id !== id));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // รีเซ็ตหน้าเป็นหน้าแรกเมื่อค้นหาใหม่
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const search = searchTerm.trim().toLowerCase();
      // แยกคำค้นหาหลายคำด้วยช่องว่าง และกรองคำที่เป็นค่าว่าง
      const searchTerms = search.split(" ").filter((term) => term.length > 0);

      // ตรวจสอบว่าเอกสารตรงกับทุกคำใน searchTerms
      return searchTerms.every((term) => {
        return (
          doc.name.toLowerCase().includes(term) ||
          doc.department.toLowerCase().includes(term) ||
          doc.date.toLowerCase().includes(term) ||
          doc.type.toLowerCase().includes(term)
        );
      });
    })
    .filter((doc) => {
      return (
        (!filters.documentName ||
          doc.name.toLowerCase().includes(filters.documentName)) &&
        (!filters.date || doc.date === filters.date) &&
        (!filters.category ||
          doc.type.toLowerCase().includes(filters.category.toLowerCase())) &&
        (!filters.department ||
          doc.department
            .toLowerCase()
            .includes(filters.department.toLowerCase()))
      );
    });

  const sortedDocuments = sortDocuments(
    filteredDocuments,
    ...sortOption.split("-")
  );

  const indexOfLastDocument = currentPage * itemsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
  const currentDocuments = sortedDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`home-container ${role === "guest" ? "guest-home" : ""}`}>
        <div className={`main-content ${role === "guest" ? "guest-main" : ""}`}>
          <h1 className="title-doc">
            ค้นหาเอกสารทั้งหมด
            {role === "guest" && (
              <>
                <a href="/">
                  <img src="./img/Logo2.png" alt="Logo" className="logo" />
                </a>
                <button
                  className="back-to-login-btn"
                  onClick={() => (window.location.href = "/login")}
                >
                  กลับไปหน้า Login
                </button>
              </>
            )}
          </h1>

          <div className="search-bar">
            <input
              type="text"
              placeholder="ค้นหาเอกสาร (ชื่อ, ประเภท, วันที่, หน่วยงาน)"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="dropdown">
            <label className="filter-label">จัดเรียงตาม: </label>
            <select
              onChange={handleSortChange}
              value={sortOption}
              className="sort-dropdown"
            >
              <option value="date-desc">ล่าสุด</option>
              <option value="date-asc">เก่าที่สุด</option>
              <option value="name-asc">ชื่อ (ก-ฮ)</option>
              <option value="name-desc">ชื่อ (ฮ-ก)</option>
            </select>
            <label className="filter-labels">ประเภทเอกสาร:</label>
            <select
              onChange={handleFilterChange}
              value={filters.category}
              name="category"
              className="sort-dropdown"
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
            {/* <span className='items-per-page'>
                        <label className='filter-label'>แสดงข้อมูล:</label>
                        <select onChange={(e) => setItemsPerPage(Number(e.target.value))} value={itemsPerPage} className="sort-dropdown">
                            <option value={5}>5 ข้อมูล</option>
                            <option value={10}>10 ข้อมูล</option>
                            <option value={15}>15 ข้อมูล</option>
                            <option value={30}>30 ข้อมูล</option>
                        </select>
                    </span> */}
          </div>
          <div className="multi-select-actions">
            {role !== "guest" && (
              <table>
                <thead>
                  <tr>
                    <th
                      className={`checkbox-th ${
                        isDownloading ? "no-radius" : ""
                      }`}
                    >
                      <button
                        onClick={toggleCheckbox}
                        className="toggle-checkbox-btn"
                      >
                        {showCheckbox ? "ยกเลิกการเลือก" : "เลือกหลายรายการ"}
                      </button>
                    </th>
                    {showCheckbox && (
                      <th className="actions-th">
                        <div className="actions-group">
                          <button
                            onClick={handleSelectAll}
                            className="toggle-select-all-btn"
                          >
                            {currentDocuments.every((doc) =>
                              selectedDocuments.includes(doc.id)
                            )
                              ? "ยกเลิกการเลือกทั้งหมด"
                              : "เลือกทั้งหมด"}
                          </button>
                          <button
                            onClick={handleDownloadSelected}
                            disabled={selectedDocuments.length === 0}
                            className="download-selected-btn"
                          >
                            ดาวน์โหลดเอกสารที่เลือก ({selectedDocuments.length})
                          </button>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
              </table>
            )}
          </div>

          <hr className="hr-top"></hr>
          <table className="document-table">
            <thead>
              <tr>
                {showCheckbox && <th></th>}
                <th className="th-num">ลำดับ</th>
                <th>ชื่อเอกสาร</th>
                <th>ประเภทเอกสาร</th>
                <th>วันที่ลง</th>
                <th>หน่วยงาน</th>
                {role !== "guest" && <th className="th-to">เครื่องมือ</th>}
              </tr>
            </thead>
            <tbody>
              {currentDocuments.map((doc, index) => (
                <tr
                  key={doc.id}
                  className={`row-item ${
                    selectedDocuments.includes(doc.id) ? "row-selected" : ""
                  }`}
                  onClick={() => handleSelectDocument(doc.id)}
                >
                  {showCheckbox && (
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox-round"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                  <td>
                    {role === "guest" ? (
                      doc.name
                    ) : (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(doc.FileUrl);
                        }}
                        className="preview-link"
                      >
                        {doc.name}
                      </a>
                    )}
                  </td>
                  <td>{doc.type}</td>
                  <td>{doc.date}</td>
                  <td>{doc.department}</td>
                  {role !== "guest" && (
                    <td>
                      <a
                        className="download-link"
                        onClick={(e) => {
                          e.stopPropagation(); // ป้องกันการ trigger การเลือกแถว
                          handleSingleDownload(doc.FileUrl, doc.name); // เรียกฟังก์ชัน handleSingleDownload
                        }}
                      >
                        ดาวน์โหลด
                      </a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-button">
            <button
              className="bp bp-outline-og page-space"
              onClick={handleFirstPage}
              disabled={currentPage === 1}
            >
              หน้าแรก
            </button>
            <button
              className="bp bp-outline-og page-space"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              หน้าก่อนหน้า
            </button>
            <span className="page-space">
              {currentPage} OF {totalPages}
            </span>
            <button
              className="bp bp-outline-og page-space"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              หน้าถัดไป
            </button>
            <button
              className="bp bp-outline-og page-space"
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
            >
              หน้าสุดท้าย
            </button>
          </div>

          {/* Preview Modal */}
          {previewFile && (
            <div className="preview-modal" onClick={closePreview}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closePreview} className="close-button">
                  ปิด
                </button>
                <iframe
                  src={previewFile}
                  className="preview-iframe"
                  title="Preview Document"
                ></iframe>
              </div>
            </div>
          )}
          {/* Alert Modal */}
          {alertMessage && (
            <div className="alert-modal" onClick={closeAlert}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closeAlert} className="close-button">
                  ปิด
                </button>
                <p>{alertMessage}</p>
              </div>
            </div>
          )}
          {isDownloadComplete && (
            <div className="download-popup">
              <span>
                <i className="bi bi-check-circle"></i>
              </span>{" "}
              &nbsp;
              {isSingleDownload ? (
                <span>
                  <b>ดาวน์โหลดเอกสารเสร็จสิ้น</b>
                </span>
              ) : (
                <span>
                  <b>ดาวน์โหลดเอกสารเสร็จสิ้นทั้งหมด </b>
                  <strong>{selectedDocuments.length}</strong> <b>รายการ</b>
                </span>
              )}
              <span
                onClick={() => setIsDownloadComplete(false)}
                style={{ cursor: "pointer" }}
              >
                &nbsp;
                <i className="bi bi-x-lg"></i>
              </span>
              <div className="progress-bar"></div>
            </div>
          )}
          {downloadPopups.map((popup, index) => (
            <div
              key={popup.id}
              className={`download-popup ${popup.hidden ? "hidden" : ""}`}
              style={{
                bottom: `${20 + index * 60}px`, // ระยะห่างจากด้านล่าง และเลื่อน popup ขึ้นด้านบน
              }}
            >
              <span>
                <i className="bi bi-check-circle"></i>
              </span>
              &nbsp;
              <span>
                <b>{popup.message}</b>
              </span>
              <span
                onClick={() => closeDownloadPopup(popup.id)}
                style={{ cursor: "pointer" }}
              >
                &nbsp;<i className="bi bi-x-lg"></i>
              </span>
              <div className="progress-bar"></div>
            </div>
          ))}
        </div>
      </div>
    </m.div>
  );
};

export default Home;
