import React, { useState, useEffect, useRef } from 'react';
import './SliderComponent.css';

import Image1 from '../ReportsImage/LaptopBG.jpg';
import Image2 from '../ReportsImage/PostIt.jpg';
import Image3 from '../ReportsImage/SolarCell.jpg';

const SliderComponent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderStats, setSliderStats] = useState({
    slide1: { downloads: 0, totalDocuments: 0, websiteViews: 0 },
    slide2: { yearStats: [] },
    slide3: { weekDocuments: 0, yearDocuments: 0, monthDocuments: 0 },
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    let downloads = 0;
    let totalDocuments = 0;

    // ดึงข้อมูลไฟล์
    fetch("http://localhost:3000/api/files")
      .then((response) => response.json())
      .then((files) => {
        downloads = files.reduce(
          (sum, file) => sum + (file.download_count || 0),
          0
        );
        totalDocuments = files.length;

        // ดึงยอดเข้าชมเว็บไซต์
        fetch("http://localhost:3000/api/website-views/count")
          .then((res) => res.json())
          .then((viewData) => {
            const websiteViews = viewData.count || 0;

            // สถิติสำหรับ Slide 2 (เอกสารย้อนหลัง 3 ปี)
            const currentYear = new Date().getFullYear() + 543;
            const countByYear = {
              [currentYear]: 0,
              [currentYear - 1]: 0,
              [currentYear - 2]: 0
            };

            files.forEach((file) => {
              const uploadDate = new Date(file.uploaded_at);
              if (!isNaN(uploadDate.getTime())) {
                const thaiYear = uploadDate.getFullYear() + 543;
                if (countByYear.hasOwnProperty(thaiYear)) {
                  countByYear[thaiYear]++;
                }
              }
            });

            const yearStats = Object.entries(countByYear)
              .sort((a, b) => b[0] - a[0])
              .map(([year, count]) => ({
                year: year,
                count: count
              }));

            // Slide 3
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
              slide2: { yearStats },
              slide3: { weekDocuments, yearDocuments, monthDocuments },
            });
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
        { value: sliderStats.slide1.downloads.toLocaleString(), label: 'ยอดดาวน์โหลดทั้งหมด', unit: 'ครั้ง' },
        { value: sliderStats.slide1.totalDocuments.toLocaleString(), label: 'ยอดเอกสารทั้งหมด', unit: 'ฉบับ' },
        { value: sliderStats.slide1.websiteViews.toLocaleString(), label: 'ยอดการเข้าเว็บไซต์', unit: 'ครั้ง' },
      ],
    },
    {
      image: Image2,
      subtitle: 'สถิติ',
      title: 'เอกสารแต่ละปี',
      description: 'ข้อมูลการอัพโหลดเอกสารแยกตามปี',
      stats: sliderStats.slide2.yearStats ? sliderStats.slide2.yearStats.map(stat => ({
        value: stat.count.toLocaleString(),
        label: `เอกสารปี ${stat.year}`,
        unit: 'ฉบับ'
      })) : [
        { value: '0', label: 'เอกสารปี -', unit: 'ฉบับ' },
        { value: '0', label: 'เอกสารปี -', unit: 'ฉบับ' },
        { value: '0', label: 'เอกสารปี -', unit: 'ฉบับ' }
      ]
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

  // ฟังก์ชันสำหรับเปลี่ยนสไลด์และ reset interval
  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % slides.length;
      return next;
    });
    resetInterval();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const next = (prev - 1 + slides.length) % slides.length;
      return next;
    });
    resetInterval();
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetInterval();
  };

  // ตั้ง interval เมื่อ slides.length เปลี่ยน หรือ component mount
  useEffect(() => {
    resetInterval();
    return () => clearInterval(intervalRef.current);
  }, [slides.length]);

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
                วันที่ {currentTime.toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}{" "}
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