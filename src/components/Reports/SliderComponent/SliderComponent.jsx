import React, { useState, useEffect } from 'react';
import './SliderComponent.css';

const SliderComponent = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slide ทุก 3 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูก unmount
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
              <h3>{slide.subtitle}</h3>
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <div className="slider-stats">
                {slide.stats.map((stat, statIndex) => (
                  <div key={statIndex} className="slider-stat-item">
                    <h2>{stat.value}</h2>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="slider-date">{slide.date}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="slider-button next" onClick={nextSlide}>
        &gt;
      </button>
    </div>
  );
};

export default SliderComponent;
