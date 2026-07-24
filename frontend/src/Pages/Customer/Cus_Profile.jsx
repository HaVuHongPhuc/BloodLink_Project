// src/Pages/Customer/Cus_Profile.jsx
import { useState, useEffect } from "react";
import Layout from "../Layout";
import ChangePassword from "./ChangePassword";

const Cus_Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    fullName: "",
    bloodType: "",
    gender: "",
    dob: "",
    phone: "",
    address: "",
    cccd: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.role === "customer");
    if (found) {
      setUser(found);
      setProfile({
        fullName: found.fullName || "",
        bloodType: found.bloodType || "",
        gender: found.gender || "",
        dob: found.dob || "",
        phone: found.phone || "",
        address: found.address || "",
        cccd: found.cccd || "",
      });
    } else {
      window.location.href = "/login";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profile.phone && !profile.phone.match(/^[0-9]{10,11}$/)) {
      setErrors({ phone: "Số điện thoại không hợp lệ" });
      return;
    }
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updated = users.map((u) => {
      if (u.email === user.email) {
        return { ...u, ...profile };
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(updated));
    setSuccessMessage("MS20: Cập nhật thành công");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (!user) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
          <p className="text-sm text-gray-500 mb-4">BM09: Hồ sơ thông tin cá nhân khách hàng</p>
          {successMessage && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Họ tên</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nhóm máu</label>
              <select
                name="bloodType"
                value={profile.bloodType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Chọn nhóm máu</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Giới tính</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Số CCCD</label>
              <input
                type="text"
                name="cccd"
                value={profile.cccd}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded"
            >
              Cập nhật
            </button>
          </form>
          <div className="mt-4">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-red-600 hover:underline"
            >
              BM10: Đổi mật khẩu
            </button>
          </div>
          {showChangePassword && (
            <div className="mt-4 border-t pt-4">
              <ChangePassword userEmail={user.email} onCancel={() => setShowChangePassword(false)} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cus_Profile;