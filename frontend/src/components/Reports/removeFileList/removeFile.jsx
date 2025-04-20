import SliderComponent from "../SliderComponent/SliderComponent";
import React, { useState, useEffect } from "react";
import "./removeFile.css";
import { motion as m } from "framer-motion";

function removeFile({ role }) {
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
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadComplete, setIsDownloadComplete] = useState(false);
    const [isSingleDownload, setIsSingleDownload] = useState(false);
    const [downloadPopups, setDownloadPopups] = useState([]);

    // ดึงข้อมูลไฟล์ที่ลบล่าสุดจาก backend
    useEffect(() => {
        const fetchDeletedFiles = async () => {
            try {
                const userData = localStorage.getItem("userData")
                    ? JSON.parse(localStorage.getItem("userData")).id
                    : null;
                if (!userData) return setDocuments([]);
                const res = await fetch(`http://localhost:3000/api/files/trash?userId=${userData}`);
                if (!res.ok) throw new Error("Failed to fetch deleted files");
                const data = await res.json();
                setDocuments(data);
            } catch (err) {
                setDocuments([]);
            }
        };
        fetchDeletedFiles();
    }, []);

    const sortDocuments = (documents, option, order) => {
        return documents.sort((a, b) => {
            if (option === "date") {
                const dateA = new Date(a.deleted_at);
                const dateB = new Date(b.deleted_at);
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
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const cleanedValue = value.trim().toLowerCase().replace(/&/g, "และ");
        setFilters((prevFilters) => ({ ...prevFilters, [name]: cleanedValue }));
        setCurrentPage(1);
    };

    const handlePreview = (fileUrl) => {
        if (fileUrl.endsWith(".xlsx")) {
            setAlertMessage("ไม่สามารถแสดงตัวอย่างไฟล์ Excel ได้ในขณะนี้");
        } else {
            setPreviewFile(fileUrl);
        }
    };

    const closeAlert = () => setAlertMessage(null);
    const closePreview = () => setPreviewFile(null);

    const toggleCheckbox = () => {
        setShowCheckbox((prev) => !prev);
        setSelectedDocuments([]);
        setIsDownloading(false);
        setIsDownloadComplete(false);
    };

    const handleSelectDocument = (id) => {
        setSelectedDocuments((prev) =>
            prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const currentDocumentIds = currentDocuments.map((doc) => doc.id);
        if (currentDocumentIds.every((id) => selectedDocuments.includes(id))) {
            setSelectedDocuments((prev) =>
                prev.filter((id) => !currentDocumentIds.includes(id))
            );
        } else {
            setSelectedDocuments((prev) => [
                ...prev,
                ...currentDocumentIds.filter((id) => !prev.includes(id)),
            ]);
        }
    };

    // ฟังก์ชันแปลงรูปแบบวันที่
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()];
        const year = date.getFullYear() + 543;
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
                (doc.date && doc.date.toLowerCase().includes(term)) ||
                doc.type.toLowerCase().includes(term)
            ));
        })
        .filter((doc) => (
            (!filters.documentName || doc.name.toLowerCase().includes(filters.documentName)) &&
            (!filters.date || doc.date === filters.date) &&
            (!filters.category || doc.type.toLowerCase().includes(filters.category.toLowerCase())) &&
            (!filters.department || doc.department.toLowerCase().includes(filters.department.toLowerCase()))
        ));

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
                        <h5 style={{ textAlign: 'center' }}>
                            เอกสารที่ลบล่าสุด
                        </h5>
                        <table className="document-table">
                            <thead>
                                <tr>
                                    {showCheckbox && <th></th>}
                                    <th className="th-num">ลำดับ</th>
                                    <th>ชื่อเอกสาร</th>
                                    <th>ประเภทเอกสาร</th>
                                    <th>วันที่ลบ</th>
                                    <th>หน่วยงาน</th>
                                    {role !== "guest" && <th className="th-to">เครื่องมือ</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan={showCheckbox ? 7 : 6} style={{ textAlign: "center", color: "#888" }}>
                                            ตอนนี้ไม่มีไฟล์ที่กำลังลบอยู่
                                        </td>
                                    </tr>
                                ) : (
                                    currentDocuments.map((doc, index) => (
                                        <tr key={doc.id}
                                            className={`row-item ${selectedDocuments.includes(doc.id) ? "row-selected" : ""}`}
                                            onClick={() => handleSelectDocument(doc.id)}>
                                            {showCheckbox && (
                                                <td className="td-removeFile">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox-round"
                                                        checked={selectedDocuments.includes(doc.id)}
                                                        onChange={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                            )}
                                            <td className="td-removeFile">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                            <td className="td-removeFile">
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
                                            <td className="td-removeFile">{doc.type}</td>
                                            <td className="td-removeFile">{formatDate(doc.deleted_at)}</td>
                                            <td className="td-removeFile">{doc.department}</td>
                                            {role !== "guest" && (
                                                <td className="td-removeFile">
                                                    <a
                                                        className="download-link"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // handleSingleDownload(doc.FileUrl, doc.name); // ปรับตามฟังก์ชันกู้คืนจริง
                                                        }}
                                                    >
                                                        กู้คืน
                                                    </a>
                                                </td>
                                            )}
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
                        {/* ...preview & alert popup as before... */}
                    </div>
                </div>
            </m.div>
        </>
    );
}

export default removeFile;