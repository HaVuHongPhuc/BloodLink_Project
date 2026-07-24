import { useState, useEffect } from "react";
import Layout from "../Layout";
import ChangePassword from "../Customer/ChangePassword";

const Hospital_Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    hospitalName: "",
    representative: "",
    address: "",
    taxCode: "",
    phone: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.role === "hospital");
    if (found) {
      setUser(found);
      setProfile({
        hospitalName: found.hospitalName || "",
        representative: found.representative || "",
        address: found.address || "",
        taxCode: found.taxCode || "",
        phone: found.phone || "",
        note: found.note || "",
      });
    } else {
      window.location.href = "/partner-login";
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
    if (!profile.phone.match(/^[0-9]{10,11}$/)) {
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
          <h1 className="text-2xl font-bold mb-6">Hồ sơ bệnh viện</h1>
          <p className="text-sm text-gray-500 mb-4">BM11: Danh sách tài khoản bệnh viện</p>
          {successMessage && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Tên bệnh viện</label>
              <input
                type="text"
                name="hospitalName"
                value={profile.hospitalName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Người đại diện</label>
              <input
                type="text"
                name="representative"
                value={profile.representative}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
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
              <label className="block text-sm font-medium">Mã số thuế</label>
              <input
                type="text"
                name="taxCode"
                value={profile.taxCode}
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
              <label className="block text-sm font-medium">Ghi chú</label>
              <textarea
                name="note"
                value={profile.note}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
                rows="2"
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
              Đổi mật khẩu
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

export default Hospital_Profile;