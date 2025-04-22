import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import logo from "../ResetPassword/logo.png";
import bg from "../ResetPassword/BG.jpg"; // ใช้ BG เดิม

const ResetPassword = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("ส่ง OTP ไปยังอีเมลของคุณเรียบร้อยแล้ว");
        setStep("otp");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("เกิดข้อผิดพลาดในการส่ง OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) return setMessage("กรุณากรอก OTP ให้ครบ 6 หลัก");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP ถูกต้อง กรุณาตั้งรหัสผ่านใหม่");
        setStep("newPassword");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const code = otp.join("");
    if (!newPassword || newPassword.length < 6) {
      return setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("รีเซ็ตรหัสผ่านสำเร็จ");
        navigate("/login");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOtp = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value;
    setOtp(newOtp);
    if (value && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const resendOTP = () => {
    setMessage("ส่ง OTP ใหม่...");
    sendOTP();
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <div className="reset-form">
          <img src={logo} alt="Logo" className="reset-logo" />
          <h2 className="reset-title">รีเซ็ตรหัสผ่าน</h2>
          <p className="reset-description">
            {step === "email"
              ? "กรอกอีเมลของคุณเพื่อรับรหัส OTP"
              : step === "otp"
              ? "กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ"
              : "กรอกรหัสผ่านใหม่ของคุณ"}
          </p>

          {step === "email" && (
            <>
              <input
                className="reset-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="reset-button"
                onClick={sendOTP}
                disabled={loading}
              >
                {loading ? "กำลังส่ง..." : "ส่งรหัส OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="otp-group">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleChangeOtp(i, e.target.value)}
                  />
                ))}
              </div>
              <button
                className="reset-button"
                onClick={verifyOTP}
                disabled={loading}
              >
                {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
              </button>
              <p className="reset-resend">
                ไม่ได้รับรหัส? <span onClick={resendOTP}>ส่งใหม่</span>
              </p>
            </>
          )}

          {step === "newPassword" && (
            <>
              <div className="password-container">
                <input
                  className="reset-input password-input"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="รหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  style={{ marginTop: "0.5rem" }}
                >
                  <i
                    className={
                      showNewPassword ? "bi bi-eye" : "bi bi-eye-slash"
                    }
                  ></i>
                </button>
              </div>
              <button
                className="reset-button"
                onClick={resetPassword}
                disabled={loading}
              >
                {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
              </button>
            </>
          )}

          {message && <p className="reset-message">{message}</p>}

          <button onClick={() => navigate("/login")} className="reset-back">
            กลับเข้าสู่ระบบ
          </button>
        </div>
        <div
          className="reset-bg"
          style={{ backgroundImage: `url(${bg})` }}
        ></div>
      </div>
    </div>
  );
};

export default ResetPassword;
