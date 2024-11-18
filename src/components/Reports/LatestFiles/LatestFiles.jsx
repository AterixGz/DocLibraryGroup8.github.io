import React from 'react';

function LatestFiles({ title }) {
  return (
    <section className="latest-files">
      <h2>{title}</h2>
      <ul>
        {[...Array(3)].map((_, index) => (
          <li key={index}>
            <span>บันทึกเรื่องลึกลับ 1...</span>
            <span>สมจิตร คิดเรื่องแสง</span>
            <span>21:29 น. 19/ต.ค./2567</span>
          </li>
        ))}
      </ul>
      <button>ดูเพิ่มเติม</button>
    </section>
  );
}

export default LatestFiles;