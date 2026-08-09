import { useState } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHospital,
  faUser,
  faMapMarkerAlt,
  faBuilding,
  faPhone,
  faEnvelope,
  faNotesMedical,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

const Hospital_Register = () => {
  const [formData, setFormData] = useState({
    TenBenhVien: "",
    NguoiDaiDien: "",
    DiaChiBenhVien: "",
    MaSoThue: "",
    SoDienThoaiBenhVien: "",
    Email: "",
    GhiChu: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^0[0-9]{9,10}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      TenBenhVien,
      NguoiDaiDien,
      DiaChiBenhVien,
      MaSoThue,
      SoDienThoaiBenhVien,
      Email,
      GhiChu,
    } = formData;

    const newErrors = {};

    if (!TenBenhVien) newErrors.TenBenhVien = "Vui lòng nhập tên bệnh viện";
    if (!NguoiDaiDien) newErrors.NguoiDaiDien = "Vui lòng nhập người đại diện";
    if (!DiaChiBenhVien) newErrors.DiaChiBenhVien = "Vui lòng nhập địa chỉ bệnh viện";
    if (!MaSoThue) newErrors.MaSoThue = "Vui lòng nhập mã số thuế";
    if (!SoDienThoaiBenhVien) {
      newErrors.SoDienThoaiBenhVien = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(SoDienThoaiBenhVien)) {
      newErrors.SoDienThoaiBenhVien = "Số điện thoại không hợp lệ (10-11 số, bắt đầu 0)";
    }
    if (!Email) {
      newErrors.Email = "Vui lòng nhập email";
    } else if (!validateEmail(Email)) {
      newErrors.Email = "Vui lòng kiểm tra lại định dạng email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/dang-ky-doi-tac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TenBenhVien: TenBenhVien.trim(),
          NguoiDaiDien: NguoiDaiDien.trim(),
          DiaChiBenhVien: DiaChiBenhVien.trim(),
          MaSoThue: MaSoThue.trim(),
          SoDienThoaiBenhVien: SoDienThoaiBenhVien.trim(),
          Email: Email.trim().toLowerCase(),
          GhiChu: GhiChu.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message || "Đăng ký tài khoản thành công");
        setErrorMessage("");
        setFormData({
          TenBenhVien: "",
          NguoiDaiDien: "",
          DiaChiBenhVien: "",
          MaSoThue: "",
          SoDienThoaiBenhVien: "",
          Email: "",
          GhiChu: "",
        });
        setTimeout(() => window.location.href = "/partner-login", 2000);
      } else {
        setErrorMessage(data.message || "Đăng ký thất bại");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối server");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <div className="w-full max-w-[600px] rounded-[16px] bg-white p-4 shadow-lg sm:p-6 lg:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-red-600 sm:h-[60px] sm:w-[60px]">
              <FontAwesomeIcon icon={faUserPlus} className="text-[24px] text-white sm:text-[28px]" />
            </div>
            <h1 className="text-[24px] font-bold text-gray-900 sm:text-[28px]">Đăng Ký Đối Tác</h1>
            <p className="mt-2 text-[13px] text-gray-500 sm:text-[14px]">Phiếu đăng ký tài khoản đối tác</p>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-[16px] py-[12px] rounded-[8px] mb-[20px] text-[14px]">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-[16px] py-[12px] rounded-[8px] mb-[20px] text-[14px]">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[16px]">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Tên bệnh viện <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faHospital} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="TenBenhVien"
                  value={formData.TenBenhVien}
                  onChange={handleChange}
                  placeholder="Bệnh viện Đa khoa Trung ương"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.TenBenhVien ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.TenBenhVien && <p className="text-red-500 text-[13px] mt-[6px]">{errors.TenBenhVien}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Người đại diện <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="NguoiDaiDien"
                  value={formData.NguoiDaiDien}
                  onChange={handleChange}
                  placeholder="PGS.TS Nguyễn Văn A"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.NguoiDaiDien ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.NguoiDaiDien && <p className="text-red-500 text-[13px] mt-[6px]">{errors.NguoiDaiDien}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Địa chỉ bệnh viện <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="DiaChiBenhVien"
                  value={formData.DiaChiBenhVien}
                  onChange={handleChange}
                  placeholder="1 Đường Trung Ương, Hà Nội"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.DiaChiBenhVien ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.DiaChiBenhVien && <p className="text-red-500 text-[13px] mt-[6px]">{errors.DiaChiBenhVien}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Mã số thuế <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="MaSoThue"
                  value={formData.MaSoThue}
                  onChange={handleChange}
                  placeholder="0101234567"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.MaSoThue ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.MaSoThue && <p className="text-red-500 text-[13px] mt-[6px]">{errors.MaSoThue}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Số điện thoại bệnh viện <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="SoDienThoaiBenhVien"
                  value={formData.SoDienThoaiBenhVien}
                  onChange={handleChange}
                  placeholder="02412345678"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.SoDienThoaiBenhVien ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.SoDienThoaiBenhVien && <p className="text-red-500 text-[13px] mt-[6px]">{errors.SoDienThoaiBenhVien}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="benhvien@example.com"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.Email ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.Email && <p className="text-red-500 text-[13px] mt-[6px]">{errors.Email}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Ghi chú
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faNotesMedical} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="GhiChu"
                  value={formData.GhiChu}
                  onChange={handleChange}
                  placeholder="Thông tin thêm..."
                  className="w-full pl-[40px] pr-[14px] py-[12px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : "Đăng Ký Đối Tác"}
            </button>
          </form>

          <div className="mt-[24px] text-center">
            <p className="text-gray-600 text-[14px]">
              Đã có tài khoản?{" "}
              <a href="/partner-login" className="text-red-600 font-semibold hover:underline">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hospital_Register;