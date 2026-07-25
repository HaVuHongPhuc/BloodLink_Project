// src/Pages/Customer/ChangePassword.jsx
import { useState } from "react";

const ChangePassword = ({ userEmail, onCancel }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) =>
    password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formData;
    const newErrors = {};

    if (!oldPassword) newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ";
    if (!newPassword) newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (!validatePassword(newPassword)) newErrors.newPassword = "MS02: Mật khẩu mới không đúng định dạng";

    if (newPassword && confirmPassword !== newPassword) newErrors.confirmPassword = "MS42: Xác nhận mật khẩu không khớp";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u) => u.email === userEmail);
    if (!user) {
      setMessage("Không tìm thấy tài khoản");
      return;
    }
    if (user.password !== oldPassword) {
      setMessage("MS22: Mật khẩu cũ không đúng");
      return;
    }

    const updated = users.map((u) => {
      if (u.email === userEmail) u.password = newPassword;
      return u;
    });
    localStorage.setItem("users", JSON.stringify(updated));
    setSuccess(true);
    setMessage("MS21: Đổi mật khẩu thành công");
    setTimeout(() => onCancel && onCancel(), 1500);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">BM10: Phiếu đổi mật khẩu</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Mật khẩu cũ</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.oldPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.oldPassword && <p className="text-red-500 text-sm">{errors.oldPassword}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.newPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>
        {message && (
          <div className={`p-2 rounded ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Đổi mật khẩu
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;