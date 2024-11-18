import React from 'react';

function FileSummary() {
  return (
    <aside className="file-summary">
      <h2>ประเภทไฟล์</h2>
      <ul>
        <li>PDF: 1032 ฉบับ</li>
        <li>PNG: 192 ฉบับ</li>
        <li>JPG: 121 ฉบับ</li>
        <li>SVG: 22 ฉบับ</li>
        <li>RAW: 5 ฉบับ</li>
      </ul>
      <h3>อัพโหลดไฟล์มากที่สุด (ใน 30 วันที่ผ่านมา)</h3>
      <ul>
        <li>สมจิตร คิดเรื่องแสง: 10 ฉบับ</li>
        <li>สมจิตร คิดเรื่องแสง: 8 ฉบับ</li>
        <li>สมจิตร คิดเรื่องแสง: 4 ฉบับ</li>
        <li>สมจิตร คิดเรื่องแสง: 3 ฉบับ</li>
        <li>สมจิตร คิดเรื่องแสง: 2 ฉบับ</li>
      </ul>
    </aside>
  );
}

export default FileSummary;