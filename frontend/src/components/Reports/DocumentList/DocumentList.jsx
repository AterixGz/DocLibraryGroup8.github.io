import SliderComponent from "../SliderComponent/SliderComponent";
import React, { useState, useEffect } from "react";
import "./addFile.css"; // ใช้ไฟล์เดียวกันได้
import { motion as m } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

function DocumentList({ role }) {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode") || "add";

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
    const [itemsPerPage] = useState(5);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [downloadPopups, setDownloadPopups] = useState([]);

    // ดึงข้อมูลจาก API
    useEffect(() => {
        let url = "http://localhost:3000/api/files";
        if (mode === "remove") {
            const userData = localStorage.getItem("userData")
                ? JSON.parse(localStorage.getItem("userData")).id
                : null;
            url = userData
                ? `http://localhost:3000/api/files/trash?userId=${userData}`
                : "";
        }
        if (!url) return setDocuments([]);
        fetch(url)
            .then((res) => res.json())
            .then((data) => setDocuments(data))
            .catch(() => setDocuments([]));
    }, [mode]);

    // ฟังก์ชันจัดเรียง
    const sortDocuments = (docs, option, order) => {
        return docs.sort((a, b) => {
            if (option === "date") {
                const dateA = new Date(mode === "remove" ? a.deleted_at : a.date);
                const dateB = new Date(mode === "remove" ? b.deleted_at : b.date);
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

    // ฟังก์ชันแปลงวันที่ (เฉพาะ remove)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()];
        const year = date.getFullYear() ;
        return `${hours}:${minutes} น. ${day}/${month}/${year}`;
    };

    // ฟิลเตอร์และจัดเรียง
    const filteredDocuments = documents
        .filter((doc) => {
            const search = searchTerm.trim().toLowerCase();
            const searchTerms = search.split(" ").filter(term => term.length > 0);
            return searchTerms.every((term) => (
                doc.name.toLowerCase().includes(term) ||
                doc.department.toLowerCase().includes(term) ||
                ((mode === "remove" ? doc.deleted_at : doc.date) || "").toLowerCase().includes(term) ||
                doc.type.toLowerCase().includes(term)
            ));
        })
        .filter((doc) => (
            (!filters.documentName || doc.name.toLowerCase().includes(filters.documentName)) &&
            (!filters.date || (mode === "remove" ? doc.deleted_at : doc.date) === filters.date) &&
            (!filters.category || doc.type.toLowerCase().includes(filters.category.toLowerCase())) &&
            (!filters.department || doc.department.toLowerCase().includes(filters.department.toLowerCase()))
        ));

    const sortedDocuments = sortDocuments(filteredDocuments, ...sortOption.split("-"));
    const indexOfLastDocument = currentPage * itemsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
    const currentDocuments = sortedDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
    const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);

    // ฟังก์ชัน preview
    const handlePreview = (fileUrl) => {
        if (fileUrl.endsWith(".xlsx")) {
            setAlertMessage("ไม่สามารถแสดงตัวอย่างไฟล์ Excel ได้ในขณะนี้");
        } else {
            setPreviewFile(fileUrl);
        }
    };
    const closeAlert = () => setAlertMessage(null);
    const closePreview = () => setPreviewFile(null);

    // ฟังก์ชันเลือกไฟล์
    const handleSelectDocument = (id) => {
        setSelectedDocuments((prev) =>
            prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
        );
    };

    // ฟังก์ชันดาวน์โหลด/กู้คืน (mock)
    const handleAction = (fileUrl, fileName) => {
        const newPopup = {
            id: Date.now(),
            message: mode === "remove" ? "กู้คืนเอกสารเสร็จสิ้น" : "ดาวน์โหลดเอกสารเสร็จสิ้น",
        };
        setDownloadPopups((prev) => [...prev, newPopup]);
        setTimeout(() => {
            setDownloadPopups((prev) => prev.filter((popup) => popup.id !== newPopup.id));
        }, 5000);
        if (mode === "add") {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = fileName;
            link.click();
        }
        // ถ้า mode remove ให้เรียก API กู้คืนจริง
    };
    const closeDownloadPopup = (id) => {
        setDownloadPopups((prev) => prev.filter((popup) => popup.id !== id));
    };

    return (
        <>
            <SliderComponent />
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className={`home-container ${role === "guest" ? "guest-home" : ""}`}>
                    <div className={`main-content ${role === "guest" ? "guest-main" : ""}`}>
                    <button
                            className="bp bp-outline-og back-absolute-btn"
                            style={{ marginBottom: "1rem" }}
                            onClick={() => navigate("/reports")}
                        >
                            <i class="fi fi-rr-arrow-left arrow-icon-10px" ></i>
                        </button>
                        <h5 style={{ textAlign: 'center' }}>
                            {mode === "remove" ? "เอกสารที่ลบล่าสุด" : "เอกสารที่เพิ่มล่าสุด"}
                        </h5>
                        <table className="document-table">
                            <thead>
                                <tr>
                                    {showCheckbox && <th></th>}
                                    <th className="th-num">ลำดับ</th>
                                    <th>ชื่อเอกสาร</th>
                                    <th>ประเภทเอกสาร</th>
                                    <th>{mode === "remove" ? "วันที่ลบ" : "วันที่ลง"}</th>
                                    <th>หน่วยงาน</th>
                                    {/* {mode === "remove" && role !== "guest" && <th>เครื่องมือ</th>} */}
                                </tr>
                            </thead>
                            <tbody>
                                {currentDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan={showCheckbox ? 7 : 6} style={{ textAlign: "center", color: "#888" }}>
                                            {mode === "remove" ? "ตอนนี้ไม่มีไฟล์ที่กำลังลบอยู่" : "ไม่มีไฟล์"}
                                        </td>
                                    </tr>
                                ) : (
                                    currentDocuments.map((doc, index) => (
                                        <tr key={doc.id}
                                            className={`row-item ${selectedDocuments.includes(doc.id) ? "row-selected" : ""}`}
                                            onClick={() => handleSelectDocument(doc.id)}>
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
                                                        onClick={(e) => { e.stopPropagation(); handlePreview(doc.FileUrl); }}
                                                        className="preview-link"
                                                    >
                                                        {doc.name}
                                                    </a>
                                                )}
                                            </td>
                                            <td>{doc.type}</td>
                                            <td>
                                                {mode === "remove"
                                                    ? formatDate(doc.deleted_at)
                                                    : doc.date}
                                            </td>
                                            <td>{doc.department}</td>
                                            {/* {mode === "remove" && role !== "guest" && (
                                                <td>
                                                    <a
                                                        className="download-link"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAction(doc.FileUrl, doc.name);
                                                        }}
                                                    >
                                                        กู้คืน
                                                    </a>
                                                </td>
                                            )} */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="page-button">
                            <button className="bp bp-outline-og page-space" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>หน้าแรก</button>
                            <button className="bp bp-outline-og page-space" onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>หน้าก่อนหน้า</button>
                            <span className="page-space">{currentPage} OF {totalPages}</span>
                            <button className="bp bp-outline-og page-space" onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>หน้าถัดไป</button>
                            <button className="bp bp-outline-og page-space" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>หน้าสุดท้าย</button>
                        </div>
                        {previewFile && (
                            <div className="preview-modal" onClick={closePreview}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={closePreview} className="close-button">ปิด</button>
                                    <iframe src={previewFile} className="preview-iframe" title="Preview Document"></iframe>
                                </div>
                            </div>
                        )}
                        {alertMessage && (
                            <div className="alert-modal" onClick={closeAlert}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={closeAlert} className="close-button">ปิด</button>
                                    <p>{alertMessage}</p>
                                </div>
                            </div>
                        )}
                        {downloadPopups.map((popup, index) => (
                            <div key={popup.id}
                                className={`download-popup ${popup.hidden ? "hidden" : ""}`}
                                style={{ bottom: `${20 + index * 60}px` }}>
                                <span><i className="bi bi-check-circle"></i></span>&nbsp;
                                <span><b>{popup.message}</b></span>
                                <span onClick={() => closeDownloadPopup(popup.id)} style={{ cursor: "pointer" }}>
                                    &nbsp;<i className="bi bi-x-lg"></i>
                                </span>
                                <div className="progress-bar"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </m.div>
        </>
    );
}

export default DocumentList;