import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./MyDocument.css";
import FileData from "../../data/FileData";

const MyDocument = ({ role }) => {
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setDocuments(FileData);
  }, []);

  const sortDocuments = (documents, option, order) => {
    return documents.sort((a, b) => {
      if (option === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      } else if (option === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
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
    setDocuments((prevDocuments) =>
      sortDocuments([...prevDocuments], option, order)
    );
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.trim().toLowerCase().replace(/&/g, "และ");
    setFilters((prevFilters) => ({ ...prevFilters, [name]: cleanedValue }));
  };

  const handlePreview = (fileUrl) => {
    setPreviewFile(fileUrl);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const toggleCheckbox = () => {
    setShowCheckbox((prev) => !prev);
    setSelectedDocuments([]);
  };

  const handleSelectDocument = (id) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleDownloadSelected = () => {
    const filesToDownload = documents.filter((doc) =>
      selectedDocuments.includes(doc.id)
    );

    filesToDownload.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.FileUrl;
      link.download = file.name;
      link.click();
    });

    setToastMessage("ดาวน์โหลดเอกสารที่เลือกสำเร็จ!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const search = searchTerm.trim().toLowerCase();
      return (
        doc.name.toLowerCase().includes(search) ||
        doc.type.toLowerCase().includes(search) ||
        doc.date.toLowerCase().includes(search) ||
        doc.department.toLowerCase().includes(search)
      );
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

  const [showPopup, setShowPopup] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const openDeletePopup = (doc) => {
    setDocumentToDelete(doc);
    setShowPopup(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      setDocuments((prevDocs) =>
        prevDocs.filter((item) => item.id !== documentToDelete.id)
      );
    }
    setToastMessage(`ลบเอกสาร "${documentToDelete.name}" สำเร็จ!`);
    setTimeout(() => setToastMessage(null), 3000);
    closePopup();
  };

  const closePopup = () => {
    setShowPopup(false);
    setDocumentToDelete(null);
  };

  return (
    <div className={`home-container ${role === "guest" ? "guest-home" : ""}`}>
      <div className={`main-content ${role === "guest" ? "guest-main" : ""}`}>
        <h1 className="title-doc">เอกสารของฉัน</h1>
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
            <option value="ปริมาณสำรองปิโตรเลียม">ปริมาณสำรองปิโตรเลียม</option>
          </select>
        </div>

        <div className="multi-select-actions">
          {role !== "guest" && (
            <>
              <button onClick={toggleCheckbox} className="toggle-checkbox-btn">
                {showCheckbox ? "ยกเลิกการเลือก" : "เลือกหลายรายการ"}
              </button>
              {showCheckbox && (
                <button
                  onClick={handleDownloadSelected}
                  disabled={selectedDocuments.length === 0}
                  className="download-selected-btn"
                >
                  ดาวน์โหลดเอกสารที่เลือก ({selectedDocuments.length})
                </button>
              )}
            </>
          )}
        </div>
        <hr className="hr-top"></hr>
        <table className="document-table">
          <thead>
            <tr>
              {showCheckbox && <th></th>}
              <th className="th-number">ลำดับ</th>
              <th>ชื่อเอกสาร</th>
              <th>ประเภทเอกสาร</th>
              <th>วันที่ลง</th>
              <th>หน่วยงาน</th>
              {role !== "guest" && <th className="th-tool">เครื่องมือ</th>}
            </tr>
          </thead>
          <tbody>
            {currentDocuments.map((doc, index) => (
              <tr key={doc.id}>
                {showCheckbox && (
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox-round"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => handleSelectDocument(doc.id)}
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
                      onClick={() => handlePreview(doc.FileUrl)}
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
                  <td className="action-buttons">
                    <div className="button-container">
                      <button
                        className="download-btn"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.FileUrl;
                          link.download = doc.name;
                          link.click();
                        }}
                      >
                        ดาวน์โหลด
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => openDeletePopup(doc)}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <AnimatePresence>
          {showPopup && (
            <div className="popup-overlay" onClick={closePopup}>
              <motion.div
                className="popup-content"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2>ยืนยันการลบ</h2>
                <p>คุณต้องการลบ "{documentToDelete?.name}" ใช่หรือไม่?</p>
                <div className="popup-buttons">
                  <button className="confirm-btn" onClick={confirmDelete}>
                    ยืนยัน
                  </button>
                  <button className="cancel-btn" onClick={closePopup}>
                    ยกเลิก
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
          >
            หน้าแรก
          </button>
          <button
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            หน้าก่อนหน้า
          </button>
          <span className="pagination-info">
            {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            หน้าถัดไป
          </button>
          <button
            className="pagination-btn"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย
          </button>
        </div>

        {previewFile && (
          <div className="modal-overlay" onClick={closePreview}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={previewFile}
                title="Document Preview"
                className="document-preview-iframe"
              ></iframe>
              <button onClick={closePreview} className="close-preview-btn">
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDocument;
