import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";

function Login({ setToken, setRole, setUsername }) {
  const usernameRef = useRef();
  const passwordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputError, setInputError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:3000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    if (!username || !password) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      setInputError(true);
      setIsLoading(false);
      return;
    }

    try {
      // ตรวจสอบก่อนทำการ login
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
      
      // Success - store user data
      const userData = response.data.user;
      setToken(userData.token);
      setRole(userData.role);
      setUsername(username);

      // Save user data to localStorage
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem('userData', JSON.stringify(userData));

      // Reset input fields
      usernameRef.current.value = "";
      passwordRef.current.value = "";

      // Redirect to the main page
      navigate("/home");

    } catch (error) {
      console.error("Login error:", error);

      // Handle errors
      if (error.response) {
        if (error.response.status === 404) {
          setErrorMessage("ชื่อผู้ใช้ไม่พบในระบบ");
        } else if (error.response.status === 401) {
          setErrorMessage("รหัสผ่านไม่ถูกต้อง");
        } else {
          setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + (error.response.data.message || "Unknown error"));
        }
      } else if (error.request) {
        setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      } else {
        setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + error.message);
      }
      
      setInputError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestToken = "guest_token";
    const guestRole = "guest";
    const guestUsername = "guest";

    setToken(guestToken);
    setRole(guestRole);
    setUsername(guestUsername);

    localStorage.setItem("token", guestToken);
    localStorage.setItem("role", guestRole);
    localStorage.setItem("username", guestUsername);
    localStorage.setItem("userData", JSON.stringify({ firstName: "Guest", lastName: "User", role: guestRole, token: guestToken, username: guestUsername }));

    navigate("/home");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <img src="../img/NewLogo.png" alt="Logo" width="300" height="300" style={{display: 'block', margin: 'auto'}} />
          <h2 className="login-form__title">ยินดีต้อนรับ</h2>
          <form onSubmit={handleLogin}>
            {/* Username Field */}
            <label className={`login-form__label ${inputError ? "error-label" : ""}`}>
              ชื่อผู้ใช้*
            </label>
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              ref={usernameRef}
              required
              className={`login-form__input ${inputError ? "input-error" : ""}`}
            />

            {/* Password Field */}
            <label className={`login-form__label ${inputError ? "error-label" : ""}`}>
              รหัสผ่าน*
            </label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่าน"
                ref={passwordRef}
                required
                className={`login-form__input password-input ${inputError ? "input-error" : ""}`}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={showPassword ? "bi bi-eye" : "bi bi-eye-slash"}></i>
              </button>
            </div>

            {/* Error Message */}
            {inputError && (
              <div className="error-message-password">
                <i className="bi bi-exclamation-circle-fill"></i> 
                {errorMessage}
              </div>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {/* Forgot Password Link */}
          <Link to="/forgot-password" className="forgot-password">
            ลืมรหัสผ่าน ?
          </Link>

          <div className="or">หรือ</div>

          {/* Guest Login Button */}
          <button onClick={handleGuestLogin} className="guest-login" disabled={isLoading}>
            เข้าสู่ระบบโดยไม่ต้องลงชื่อเข้าใช้
          </button>
        </div>
        <div className="login-bg"></div>
      </div>
    </div>
  );
}

export default Login;
