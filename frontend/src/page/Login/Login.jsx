import React, { useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import "./Login.css";
import axios from "axios";

function Login() {
  const { setToken, setRole, setUsername, setUserData } =
    useContext(AuthContext); // ✅ ดึง setUserData
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
      const response = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
      });

      const userData = response.data.user;

      // ✅ อัปเดต context ก่อน navigate
      setUserData(userData); // <-- สำคัญ!
      setToken(userData.token);
      setRole(userData.role);
      setUsername(userData.username);

      // ✅ บันทึก localStorage ด้วย
      localStorage.setItem("token", userData.token);
      localStorage.setItem("userData", JSON.stringify(userData));

      // ✅ ล้างฟอร์ม
      usernameRef.current.value = "";
      passwordRef.current.value = "";

      // ✅ ไปหน้า home
      navigate("/home");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setErrorMessage("ชื่อผู้ใช้ไม่พบในระบบ");
        } else if (error.response.status === 401) {
          setErrorMessage("รหัสผ่านไม่ถูกต้อง");
        } else {
          setErrorMessage("เกิดข้อผิดพลาด: " + error.response.data.message);
        }
      } else {
        setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
      setInputError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    const guestToken = "guest_token";
    const guestRole = "guest";
    const guestUsername = "guest";

    try {
      // 🔁 ดึง user จาก localStorage ชั่วคราวเพื่อหาว่า guest มี id อะไร
      const res = await axios.get(`http://localhost:3000/api/roles`, {
        headers: { Authorization: `Bearer ${guestToken}` },
      });

      const guestRoleObj = res.data.find((r) => r.name === "guest");

      if (!guestRoleObj) {
        alert("ไม่พบ role guest");
        return;
      }

      const permRes = await axios.get(
        `http://localhost:3000/api/roles/${guestRoleObj.id}/permissions`,
        {
          headers: { Authorization: `Bearer ${guestToken}` },
        }
      );

      const permissions = permRes.data.map((p) => p.name);

      const guestUser = {
        id: 0, // หรือใส่เลข guest เฉย ๆ
        first_name: "Guest",
        last_name: "User",
        role: guestRole,
        token: guestToken,
        username: guestUsername,
        permissions,
      };

      localStorage.setItem("userData", JSON.stringify(guestUser));
      localStorage.setItem("token", guestToken);

      setToken(guestToken);
      setRole(guestRole);
      setUsername(guestUsername);
      setUserData(guestUser); // ✅ สำคัญมาก

      navigate("/home");
    } catch (err) {
      console.error("❌ Guest login failed", err);
      alert("เข้าสู่ระบบแบบ guest ไม่สำเร็จ");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <img
            src="../img/NewLogo.png"
            alt="Logo"
            width="300"
            height="300"
            style={{ display: "block", margin: "auto" }}
          />
          <h2 className="login-form__title">ยินดีต้อนรับ</h2>
          <form onSubmit={handleLogin}>
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
              >
                <i
                  className={showPassword ? "bi bi-eye" : "bi bi-eye-slash"}
                ></i>
              </button>
            </div>

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

          <Link to="/forgot-password" className="forgot-password">
            ลืมรหัสผ่าน ?
          </Link>

          <div className="or">หรือ</div>

          <button
            onClick={handleGuestLogin}
            className="guest-login"
            disabled={isLoading}
          >
            เข้าสู่ระบบโดยไม่ต้องลงชื่อเข้าใช้
          </button>
        </div>
        <div className="login-bg"></div>
      </div>
    </div>
  );
}

export default Login;
