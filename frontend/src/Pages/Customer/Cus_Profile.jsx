import { useState, useEffect } from "react";
import Layout from "../Layout";
import ChangePassword from "./ChangePassword";

const Cus_Profile = () => {
  const [user, setUser] = useState(null);
  // quản lý tab đang được chọn: 'profile', 'password', hoặc 'orders'
  const [activeTab, setActiveTab] = useState("profile");
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
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  // tính ngày tối đa được chọn cho ngày sinh (đảm bảo khách hàng từ 10 tuổi trở lên)
  const getMaxDob = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 10);
    return today.toISOString().split("T")[0];
  };

  // truy vấn thông tin hồ sơ từ mongodb khi tải trang
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/api/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          const data = result.data;
          setUser(data);
          setProfile({
            fullName: data.HoTen || "",
            bloodType: data.NhomMau || "",
            gender: data.GioiTinh || "Nam",
            dob: data.NgaySinh ? new Date(data.NgaySinh).toISOString().split("T")[0] : "",
            phone: data.SoDienThoai || "",
            address: data.DiaChi || "",
            cccd: data.SoCCCD || "",
          });
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    if (activeTab !== "orders") return;

    const token = localStorage.getItem("userToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setLoadingOrders(true);
    fetch("http://localhost:5000/api/blood/my-orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setOrders(result.data || []);
        } else {
          setOrders([]);
        }
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
  };

  // gửi dữ liệu cập nhật về mongodb thông qua backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // ràng buộc số điện thoại từ 10 đến 15 số
    if (profile.phone && !profile.phone.match(/^[0-9]{10,15}$/)) {
      newErrors.phone = "Số điện thoại phải từ 10 đến 15 chữ số";
    }

    // kiểm tra ràng buộc từ 10 tuổi trở lên
    if (profile.dob) {
      const selectedDob = new Date(profile.dob);
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 10);

      if (selectedDob > minAgeDate) {
        newErrors.dob = "Khách hàng phải từ 10 tuổi trở lên";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = localStorage.getItem("userToken");

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          HoTen: profile.fullName,
          NhomMau: profile.bloodType,
          GioiTinh: profile.gender,
          NgaySinh: profile.dob || null,
          SoDienThoai: profile.phone,
          DiaChi: profile.address,
          SoCCCD: profile.cccd,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("MS20: Cập nhật thành công");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrors({ general: result.message || "Cập nhật thất bại" });
      }
    } catch (error) {
      setErrors({ general: "Lỗi kết nối máy chủ" });
    }
  };

  // định dạng ngày giờ hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có dữ liệu";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa có dữ liệu";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  if (!user) return <Layout><div className="p-8 text-center">Đang tải thông tin...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Thông tin tài khoản</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* thanh lựa chọn bên tay trái */}
          <div className="w-full md:w-64 bg-gray-50 p-2 rounded-lg h-fit space-y-1 border border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left py-2 px-4 text-sm font-medium transition ${
                activeTab === "profile"
                  ? "bg-white text-black font-bold border-l-4 border-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full text-left py-2 px-4 text-sm font-medium transition ${
                activeTab === "password"
                  ? "bg-white text-black font-bold border-l-4 border-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Đổi lại mật khẩu
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left py-2 px-4 text-sm font-medium transition ${
                activeTab === "orders"
                  ? "bg-white text-black font-bold border-l-4 border-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Xem đơn đăng ký
            </button>
          </div>

          {/* nội dung hiển thị bên tay phải */}
          <div className="flex-1 bg-white shadow rounded-lg p-6 border border-gray-100 space-y-8">
            {activeTab === "profile" && (
              <div>
                {/* phần 1: tổng quan hệ thống (chỉ xem) */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-gray-200">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block">Trạng thái tài khoản</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300 mt-1">
                      Đang hoạt động
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block">Ngày tham gia</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatDateTime(user.NgayThamGia)}
                      </span>
                    </div>
                  </div>

                  {/* thống kê lượt hiến và nhận máu */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center pt-1">
                    <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                      <span className="text-xs text-gray-500 block">Lượt hiến máu</span>
                      <span className="text-xl font-bold text-red-600">{user.LuotHien || 0}</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                      <span className="text-xs text-gray-500 block">Lượt nhận máu</span>
                      <span className="text-xl font-bold text-blue-600">{user.LuotDangKyNhanMau || 0}</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                      <span className="text-xs text-gray-500 block">Ngày hiến máu gần nhất</span>
                      <span className="text-xs font-semibold text-gray-700 block mt-1">
                        {formatDate(user.NgayHienGanNhat)}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                      <span className="text-xs text-gray-500 block">Đăng ký nhận máu gần nhất</span>
                      <span className="text-xs font-semibold text-gray-700 block mt-1">
                        {formatDate(user.NgayDangKyNhanMauGanNhat)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* phần 2: thông tin cá nhân có thể cập nhật */}
                <h2 className="text-xl font-bold mb-4">Hồ sơ cá nhân</h2>

                {successMessage && (
                  <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>
                )}
                {errors.general && (
                  <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* email cố định không cho phép sửa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email tài khoản (Cố định)</label>
                    <input
                      type="text"
                      value={user.Email || user.email || ""}
                      disabled
                      readOnly
                      className="w-full border border-gray-300 bg-gray-100 font-bold text-gray-800 rounded px-3 py-2 cursor-not-allowed select-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <input
                        type="text"
                        name="fullName"
                        maxLength={255}
                        placeholder="Nhập họ và tên"
                        value={profile.fullName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        name="phone"
                        maxLength={15}
                        placeholder="Nhập số điện thoại"
                        value={profile.phone}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 focus:outline-none ${
                          errors.phone ? "border-red-500" : "border-gray-300 focus:ring-1 focus:ring-red-500"
                        }`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD / Hộ chiếu</label>
                      <input
                        type="text"
                        name="cccd"
                        maxLength={15}
                        placeholder="Nhập số CCCD"
                        value={profile.cccd}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh (Từ 10 tuổi trở lên)</label>
                      <input
                        type="date"
                        name="dob"
                        max={getMaxDob()}
                        value={profile.dob}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 focus:outline-none ${
                          errors.dob ? "border-red-500" : "border-gray-300 focus:ring-1 focus:ring-red-500"
                        }`}
                      />
                      {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                      <select
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    {/* nhóm máu: chọn hoặc tự điền tối đa 5 ký tự */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm máu (Chọn hoặc tự nhập)</label>
                      <input
                        type="text"
                        list="bloodTypeSuggestions"
                        name="bloodType"
                        maxLength={5}
                        placeholder="Chọn hoặc gõ (VD: O+, AB-)"
                        value={profile.bloodType}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <datalist id="bloodTypeSuggestions">
                        <option value="A+" />
                        <option value="A-" />
                        <option value="B+" />
                        <option value="B-" />
                        <option value="AB+" />
                        <option value="AB-" />
                        <option value="O+" />
                        <option value="O-" />
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ liên hệ</label>
                    <input
                      type="text"
                      name="address"
                      maxLength={255}
                      placeholder="Nhập địa chỉ hiện tại"
                      value={profile.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded transition shadow"
                    >
                      Cập nhật thông tin
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Đổi lại mật khẩu</h2>
                <ChangePassword userEmail={user.Email || user.email} />
              </div>
            )}

            {activeTab === "orders" && (
  <div>
    <h2 className="text-xl font-bold mb-4">Danh sách đơn đăng ký của khách hàng</h2>
    
              {loadingOrders ? (
                <p className="text-gray-500 text-sm">Đang tải danh sách đơn...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  Chưa có đơn đăng ký nào được ghi nhận.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm text-left">
                    <thead>
                      <tr className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 whitespace-nowrap">
                        <th className="border border-gray-300 p-2.5 text-center w-12">STT</th>
                        <th className="border border-gray-300 p-2.5 text-center">Mã tài khoản</th>
                        <th className="border border-gray-300 p-2.5 text-center">Mã đơn</th>
                        <th className="border border-gray-300 p-2.5 text-center">Loại đơn</th>
                        <th className="border border-gray-300 p-2.5">Họ tên người gửi</th>
                        <th className="border border-gray-300 p-2.5 text-center">Điện thoại</th>
                        <th className="border border-gray-300 p-2.5">Email</th>
                        <th className="border border-gray-300 p-2.5 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => {
                        // định dạng hiển thị tên trạng thái rõ nghĩa
                        const formatTrangThai = (status) => {
                          switch (status) {
                            case 'Cho_Duyet':
                            case 'Cho_Xu_Ly':
                              return 'Chờ duyệt';
                            case 'Dat_Y_Te':
                              return 'Đạt y tế';
                            case 'Hoan_Thanh':
                              return 'Hoàn thành';
                            case 'Tu_Choi':
                              return 'Từ chối';
                            default:
                              return status || 'Chờ duyệt';
                          }
                        };

                        return (
                          <tr key={order._id || index} className="hover:bg-gray-50 border-b border-gray-200">
                            <td className="border border-gray-300 p-2.5 text-center font-medium whitespace-nowrap">{index + 1}</td>
                            <td className="border border-gray-300 p-2.5 text-center font-medium whitespace-nowrap">{order.MaTaiKhoan}</td>
                            <td className="border border-gray-300 p-2.5 text-center font-semibold text-red-600 whitespace-nowrap">{order.MaDon}</td>
                            <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">
                              <span className={`inline-block px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${order.LoaiDon === 'Hien' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {order.LoaiDon === 'Hien' ? 'Hiến máu' : 'Nhận máu'}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2.5 font-medium whitespace-nowrap">{order.HoTen}</td>
                            <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">{order.SoDienThoai}</td>
                            <td className="border border-gray-300 p-2.5 whitespace-nowrap">{order.Email}</td>
                            <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                                {formatTrangThai(order.TrangThai)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cus_Profile;