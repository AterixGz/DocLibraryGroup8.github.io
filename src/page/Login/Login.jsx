import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./Login.css";
import { verifyUser } from "../../data/users";

function Login({ setToken, setRole, setUsername, setPassword }) {
  const usernameRef = useRef();
  const passwordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = (e) => {
    e.preventDefault();
    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    // Clear input fields after capturing the values
    usernameRef.current.value = "";
    passwordRef.current.value = "";

    // Verify user credentials
    const userInfo = verifyUser(username, password);
    if (userInfo === null) {
      alert("ชื่อผู้ใช้หรือรหัสผ่านผิด");
      usernameRef.current.focus();
    } else {
      setToken(userInfo.token);
      setRole(userInfo.role);
      setUsername(username);
      setPassword(password);
      navigate("/"); // Redirect to home after login
    }
  };

  const handleGuestLogin = () => {
    setToken("guest_token");
    setRole("guest");
    setUsername("guest");
    setPassword("");
    navigate("/"); // Redirect to home for guest login
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>ยินดีต้อนรับ</h2>
          <form onSubmit={handleLogin}>
            <label className="login-form__label">ชื่อผู้ใช้*</label>
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              ref={usernameRef}
              required
              className="login-form__input"
            />
            <label className="login-form__label">รหัสผ่าน*</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่าน"
                ref={passwordRef}
                required
                className="login-form__input password-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={showPassword ? "bi bi-eye" : "bi bi-eye-slash"}
                ></i>
              </button>
            </div>

            <button type="submit" className="login-button">
              เข้าสู่ระบบ
            </button>
          </form>
          <Link to="/forgot-password" className="forgot-password">
            ลืมรหัสผ่าน ?
          </Link>
          <div className="or">หรือ</div>
          <button onClick={handleGuestLogin} className="guest-login">
            เข้าสู่ระบบโดยไม่ต้องลงชื่อเข้าใช้
          </button>
        </div>
        <div className="login-bg"></div>
      </div>
    </div>
  );
}

export default Login;
