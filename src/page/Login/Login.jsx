import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { verifyUser } from "../../data/users";

function Login({ setToken, setRole, setUsername, setPassword }) {
  const usernameRef = useRef();
  const passwordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputError, setInputError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    usernameRef.current.value = "";
    passwordRef.current.value = "";

    const userInfo = verifyUser(username, password);
    if (userInfo === null) {
      setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านผิด");
      setInputError(true); // Highlight the input fields
      usernameRef.current.focus();
    } else {
      setErrorMessage("");
      setInputError(false); // Reset input styles
      setToken(userInfo.token);
      setRole(userInfo.role);
      setUsername(username);
      setPassword(password);
      navigate("/");
    }
  };

  const handleGuestLogin = () => {
    setToken("guest_token");
    setRole("guest");
    setUsername("guest");
    setPassword("");
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2 className="login-form__title">ยินดีต้อนรับ</h2>
          <form onSubmit={handleLogin}>
            {/* Username */}
            <label
              className={`login-form__label ${inputError ? "error-label" : ""}`}
            >
              ชื่อผู้ใช้*
            </label>
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้"
              ref={usernameRef}
              required
              className={`login-form__input ${inputError ? "input-error" : ""}`}
            />
            {/* Password */}
            <label
              className={`login-form__label ${inputError ? "error-label" : ""}`}
            >
              รหัสผ่าน*
            </label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่าน"
                ref={passwordRef}
                required
                className={`login-form__input password-input ${
                  inputError ? "input-error" : ""
                }`}
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
          {errorMessage && (
            <div className="error-message">
              <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
            </div>
          )}
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
