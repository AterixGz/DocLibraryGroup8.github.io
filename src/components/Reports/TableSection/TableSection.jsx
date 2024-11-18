import React from 'react';

function TableSection() {
  return (
    <section className="table-section">
      <table>
        <thead>
          <tr>
            <th>หน่วยงาน</th>
            <th>จำนวนเอกสาร</th>
            <th>อัพโหลดล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td>หน่วยงานXXX</td>
              <td>357 ฉบับ</td>
              <td>19/10/2024</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button>หน้าแรก</button>
        <button>ก่อนหน้า</button>
        <span>1 / 10</span>
        <button>ต่อไป</button>
        <button>สุดท้าย</button>
      </div>
    </section>
  );
}

export default TableSection;