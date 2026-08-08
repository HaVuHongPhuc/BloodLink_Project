import { useState } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faTimes } from "@fortawesome/free-solid-svg-icons";

const SendNotification = ({ maBenhVien, tenBenhVien, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    maTaiKhoan: "",
    noiDung: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("userToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maTaiKhoan, noiDung } = formData;

    const newErrors = {};
    if (!maTaiKhoan) newErrors.maTaiKhoan = "Vui lòng nhập mã tài khoản khách hàng";
    if (!noiDung || noiDung.trim() === "") {
      newErrors.noiDung = "MS40: Vui lòng điền nội dung thông báo";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/thong-bao/gui", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maTaiKhoan: maTaiKhoan.trim(),
          noiDung: noiDung.trim(),
          maBenhVien: maBenhVien,
          tenBenhVien: tenBenhVien,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Gửi thông báo thành công!");
        setFormData({ maTaiKhoan: "", noiDung: "" });
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage("" + (data.message || "Gửi thông báo thất bại"));
      }
    } catch (error) {
      setMessage("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">BM13: Gửi thông báo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded mb-4 ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã tài khoản khách hàng <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="maTaiKhoan"
              value={formData.maTaiKhoan}
              onChange={handleChange}
              placeholder="TK002"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.maTaiKhoan ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.maTaiKhoan && <p className="text-red-500 text-sm mt-1">{errors.maTaiKhoan}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung thông báo <span className="text-red-600">*</span>
            </label>
            <textarea
              name="noiDung"
              value={formData.noiDung}
              onChange={handleChange}
              rows="4"
              placeholder="Nhập nội dung thông báo yêu cầu hiến máu..."
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.noiDung ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.noiDung && <p className="text-red-500 text-sm mt-1">{errors.noiDung}</p>}
          </div>

          <div className="text-xs text-gray-400 mb-4">
            * Bệnh viện: {tenBenhVien} (Mã: {maBenhVien})
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            {loading ? "Đang gửi..." : "Gửi thông báo"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;