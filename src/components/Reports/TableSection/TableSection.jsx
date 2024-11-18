import React from 'react';
import './TableSection.css';
function TableSection() {
  return (
    <section className="table-section">
      <h3 id='title-report-table'>หน่วยงาน</h3>
      <table id='table-report'>
        <thead>
          <tr>
            <th>หน่วยงาน</th>
            <th>จำนวนเอกสาร</th>
            <th>อัพโหลดล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, index) => (
            <tr className='border-bottom-document-report' key={index}>
              <td>หน่วยงานXXX</td>
              <td>357 ฉบับ</td>
              <td>19/10/2024</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-report">
        <button className='pagination-button-report'>หน้าแรก</button>
        <button className='pagination-button-report'>ก่อนหน้า</button>
        <span id='span-pagination'>1 / 10</span>
        <button className='pagination-button-report'>ต่อไป</button>
        <button className='pagination-button-report'>สุดท้าย</button>
      </div>
    </section>
  );
}

export default TableSection;