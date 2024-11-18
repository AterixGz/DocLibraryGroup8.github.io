import React from "react";
import Slider from "react-slick";
import SliderComponent from "./SliderComponent/SliderComponent"
import FileSummary from "./FileSummary/FileSummary";
import LatestFiles from "./LatestFiles/LatestFiles";
import './Reports.css';
import TableSection from "./TableSection/TableSection";

const slides = [
  {
    image: 'https://media.discordapp.net/attachments/1286344294826770433/1307390188095537162/photo-1508514177221-188b1cf16e9dawda.jpg?ex=673a217e&is=6738cffe&hm=3bc31f4059e47cdbd6de5116eb0a0b4ea1ccdd9c176a715cb6052ffa971df98c&=&format=webp&width=1211&height=356',
    subtitle: 'สถิติ',
    title: 'ข้อมูลทั่วไป',
    description: 'ข้อมูลสถิติการดาวน์โหลดไฟล์',
    stats: [
      { value: '12,304', label: 'ยอดดาวน์โหลด', unit: 'ครั้ง' },
      { value: '1,589', label: 'ยอดเอกสารทั้งหมด', unit: 'ครั้ง' },
      { value: '104,204', label: 'ยอดเข้าชมเว็บไซต์', unit: 'ครั้ง' },
    ],
    date: '19/10/2567 เวลา 19:XX น.',
  },
  {
    image: 'https://media.discordapp.net/attachments/1286344294826770433/1307389902228422677/vintage-camera-pencil-open-laptop-twig-isolated-white-backgroundawd.jpg?ex=673a213a&is=6738cfba&hm=3cc839161590c86b48cdfdb5bab6036c8aa5f955ab5cd51061c79a408d414dd9&=&format=webp&width=1211&height=446',
    subtitle: 'สถิติ',
    title: 'เอกสารแต่ละปี',
    description: 'ข้อมูลเอกสารแยกตามปี',
    stats: [
      { value: '359', label: 'เอกสารปี 2567', unit: 'ฉบับ' },
      { value: '250', label: 'เอกสารปี 2566', unit: 'ฉบับ' },
      { value: '159', label: 'เอกสารปี 2565', unit: 'ฉบับ' },
    ],
    date: '19/10/2567 เวลา 19:XX น.',
  },
  {
    image: 'https://media.discordapp.net/attachments/1286344294826770433/1307389902668828702/13311383_v602-nunoon-50-rippednotesasd.jpg?ex=673a213a&is=6738cfba&hm=b9452b5cdb9f737552defa97d5c58a44d27d140f8c7b7e5dfff9307a614e57cb&=&format=webp&width=1211&height=424',
    subtitle: 'สถิติ',
    title: 'เอกสารในปีนี้',
    description: 'ข้อมูลเอกสารประจำเดือนและปี',
    stats: [
      { value: '12', label: 'เอกสารในสัปดาห์นี้', unit: 'ฉบับ' },
      { value: '359', label: 'ยอดเอกสารในปีนี้', unit: 'ฉบับ' },
      { value: '50', label: 'เอกสารในเดือนนี้', unit: 'ฉบับ' },
    ],
    date: '19/10/2567 เวลา 19:XX น.',
  },
];

const Reports = () => {
  return (
    <>
      <div className="aWholeContent">
        <SliderComponent slides={slides} />
        <div className="content">
          <div className="flex1">
            <div className="Document-section">
              <TableSection />
            </div>
            <div className="Document-type">
              <FileSummary />
            </div>
          </div>
          <div className="flex2">
            <div className="Document-Upload">
              <LatestFiles title="ไฟล์ที่เพิ่มล่าสุด" />
            </div>
            <div className="Document-Delete">
              <LatestFiles title="ไฟล์ที่ลบล่าสุด" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
