import React, { useState, useEffect } from 'react';
import './SliderComponent.css';

import Image1 from '../ReportsImage/LaptopBG.jpg';
import Image2 from '../ReportsImage/PostIt.jpg';
import Image3 from '../ReportsImage/SolarCell.jpg';

const SliderComponent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderStats, setSliderStats] = useState({
    slide1: { downloads: 0, totalDocuments: 0, websiteViews: 0 },
    slide2: { doc2567: 0, doc2566: 0, doc2565: 0 },
    slide3: { weekDocuments: 0, yearDocuments: 0, monthDocuments: 0 },
  });

  // ดึงข้อมูลไฟล์จาก API แล้วคำนวณสถิติ
  useEffect(() => {
    fetch("http://localhost:3000/api/files")
      .then((response) => response.json())
      .then((files) => {
        // สถิติสำหรับ Slide 1
        const totalDocuments = files.length;
        const downloads = 0; // ยังไม่มีข้อมูลจริง
        const websiteViews = 0; // ยังไม่มีข้อมูลจริง

        // สถิติสำหรับ Slide 2 (เอกสารแต่ละปี)
        // ใช้ document_date หากมี หากไม่มีก็ใช้ uploaded_at และแปลงเป็น พ.ศ.
        const countByYear = { '2567': 0, '2566': 0, '2565': 0 };
        // ภายใน useEffect หลังจาก forEach ของ countByYear
        files.forEach((file) => {
          let date = file.document_date ? new Date(file.document_date) : new Date(file.uploaded_at);
          if (!isNaN(date.getTime())) {
            const beYear = date.getFullYear() + 543;
            if (beYear === 2567) countByYear['2567']++;
            else if (beYear === 2566) countByYear['2566']++;
            else if (beYear === 2565) countByYear['2565']++;
          }
        });
        console.log("countByYear:", countByYear);

        // สถิติสำหรับ Slide 3 ("เอกสารในปีนี้")
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        let weekDocuments = 0, yearDocuments = 0, monthDocuments = 0;
        files.forEach((file) => {
          let date = new Date(file.uploaded_at);
          if (!isNaN(date.getTime())) {
            if (date >= oneWeekAgo) weekDocuments++;
            if (date.getFullYear() === now.getFullYear()) {
              yearDocuments++;
              if (date.getMonth() === now.getMonth()) monthDocuments++;
            }
          }
        });

        setSliderStats({
          slide1: { downloads, totalDocuments, websiteViews },
          slide2: { doc2567: countByYear['2567'] || 0, doc2566: countByYear['2566'] || 0, doc2565: countByYear['2565'] || 0 },
          slide3: { weekDocuments, yearDocuments, monthDocuments },
        });
      })
      .catch((err) => console.error("Error fetching files:", err));
  }, []);

  // กำหนด slides ที่มีข้อมูลภาพและข้อมูลคงที่ จากนั้นแทรกสถิติจาก sliderStats
  const slides = [
    {
      image: Image1,
      subtitle: 'สถิติ',
      title: 'ข้อมูลทั่วไป',
      description: 'ข้อมูลสถิติการดาวน์โหลดไฟล์',
      stats: [
        { value: sliderStats.slide1.downloads.toLocaleString(), label: 'ยอดดาวน์โหลด', unit: 'ครั้ง' },
        { value: sliderStats.slide1.totalDocuments.toLocaleString(), label: 'ยอดเอกสารทั้งหมด', unit: 'ฉบับ' },
        { value: sliderStats.slide1.websiteViews.toLocaleString(), label: 'ยอดเข้าชมเว็บไซต์', unit: 'ครั้ง' },
      ],
    },
    {
      image: Image2,
      subtitle: 'สถิติ',
      title: 'เอกสารแต่ละปี',
      description: 'ข้อมูลเอกสารแยกตามปี',
      stats: [
        { value: sliderStats.slide2.doc2567.toLocaleString(), label: 'เอกสารปี 2567', unit: 'ฉบับ' },
        { value: sliderStats.slide2.doc2566.toLocaleString(), label: 'เอกสารปี 2566', unit: 'ฉบับ' },
        { value: sliderStats.slide2.doc2565.toLocaleString(), label: 'เอกสารปี 2565', unit: 'ฉบับ' },
      ],
    },
    {
      image: Image3,
      subtitle: 'สถิติ',
      title: 'เอกสารในปีนี้',
      description: 'ข้อมูลเอกสารประจำเดือนและปี',
      stats: [
        { value: sliderStats.slide3.weekDocuments.toLocaleString(), label: 'เอกสารในสัปดาห์นี้', unit: 'ฉบับ' },
        { value: sliderStats.slide3.yearDocuments.toLocaleString(), label: 'ยอดเอกสารในปีนี้', unit: 'ฉบับ' },
        { value: sliderStats.slide3.monthDocuments.toLocaleString(), label: 'เอกสารในเดือนนี้', unit: 'ฉบับ' },
      ],
    },
  ];

  // Auto Slide ทุก 10 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // อัปเดตเวลาใน realtime (สำหรับแสดงวันที่/เวลา)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-container">
      <button className="slider-button prev" onClick={prevSlide}>
        &lt;
      </button>
      <div
        className="slider-slide-wrapper"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div className="slider-slide" key={index}>
            <img src={slide.image} alt={slide.title} />
            <div className="slider-content">
              <h2 className='white'>{slide.subtitle}</h2>
              <div className="slider-stats">
                {slide.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="slider-stat-item">
                    <h3>{stat.label}</h3>
                    <h1>{stat.value}</h1>
                    <h3>{stat.unit}</h3>
                  </div>
                ))}
              </div>
              <p>
                วันที่ {currentTime.toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
                เวลา {currentTime.toLocaleTimeString("en-GB")} น.
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="slider-button next" onClick={nextSlide}>
        &gt;
      </button>
      <div className="slider-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator-dot ${currentSlide === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default SliderComponent;