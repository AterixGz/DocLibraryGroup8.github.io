import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./Profile.css";
import { AuthContext } from "../../contexts/AuthContext"; // ปรับ path ให้ตรงกับของคุณ

function Profile() {
  const [userData, setUserData] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setUserData: updateUserData } = useContext(AuthContext); // ✅ เปลี่ยนชื่อเพื่อไม่ชน

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const token = localStorage.getItem("token");

      axios
        .get(`http://localhost:3000/api/profile?userId=${parsedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUserData(res.data);
          setFormData({
            first_name: res.data.first_name || "",
            last_name: res.data.last_name || "",
            email: res.data.email || "",
          });
          setAvatarPreview(res.data.avatar || "/img/default-avatar.png");
        })
        .catch((err) => {
          console.error("Failed to load profile:", err);
        });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId, token) => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const res = await axios.post(
      `http://localhost:3000/api/profile/upload-avatar/${userId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.avatar;
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const stored = JSON.parse(localStorage.getItem("userData"));
      const userId = stored.id;

      let avatarUrl = userData.avatar;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(userId, token);
      }

      const res = await axios.put(
        `http://localhost:3000/api/profile/${userId}`,
        {
          ...formData,
          avatar: avatarUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = {
        ...stored,
        ...formData,
        avatar: avatarUrl,
      };

      localStorage.setItem("userData", JSON.stringify(updatedUser));
      updateUserData(updatedUser); // ✅ update context
      setUserData(updatedUser); // ✅ update local state

      setSuccessMessage("✅ บันทึกข้อมูลเรียบร้อยแล้ว");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!userData) {
    return (
      <motion.div className="loading-container">
        <p>Loading...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="profile"
    >
      <h1 className="profile__header">โปรไฟล์</h1>
      <hr className="dividermain" />

      <div className="profile__avatar-container">
        <label htmlFor="avatar-upload" className="profile__avatar-label">
          <img src={avatarPreview} alt="Profile" className="profile__avatar" />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>

      <div className="profile__info">
        <div className="profile__form-group--name">
          <div className="profile__form-group">
            <label>ชื่อจริง</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="profile__form-group">
            <label>นามสกุล</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="profile__form-group">
          <label>E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="profile__form-group--name">
          <div className="profile__form-group">
            <label>แผนก</label>
            <input type="text" value={userData.department} readOnly />
          </div>
          <div className="profile__form-group">
            <label>ตำแหน่ง</label>
            <input type="text" value={userData.role || "—"} readOnly />
          </div>
        </div>

        <div className="profile__form-group">
          <label>รหัสพนักงาน</label>
          <input type="text" value={userData.employee_id || "—"} readOnly />
        </div>

        <button
          className="profile__save-button"
          onClick={() => setShowConfirm(true)}
        >
          💾 บันทึก
        </button>

        {showConfirm && (
          <div className="profile__popup-overlay">
            <div className="profile__confirm-popup">
              <div className="popup-content">
                <p>คุณต้องการบันทึกการเปลี่ยนแปลงในโปรไฟล์ใช่หรือไม่?</p>
                <button
                  className="popup-confirm"
                  onClick={() => {
                    handleSave();
                    setShowConfirm(false);
                  }}
                >
                  ยืนยัน
                </button>
                <button
                  className="popup-cancel"
                  onClick={() => setShowConfirm(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <motion.div
            className="profile__success-popup"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {successMessage}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default Profile;
