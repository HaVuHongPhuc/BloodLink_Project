import { useState } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faHospital } from "@fortawesome/free-solid-svg-icons";

const Hospital_Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    representative: "",
    address: "",
    taxCode: "",
    phone: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getUsers = () => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : [];
  };

  const saveUsers = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const validatePhone = (phone) => /^[0-9]{10,11}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, hospitalName, representative, address, taxCode, phone, note } = formData;
    const newErrors = {};

    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(email)) newErrors.email = "MS06: Vui lòng kiểm tra lại định dạng email";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (!validatePassword(password)) newErrors.password = "MS02: Vui lòng nhập đúng trường dữ liệu";

    if (!confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (password && confirmPassword !== password) newErrors.confirmPassword = "MS42: Mật khẩu xác nhận không đúng";

    if (!hospitalName) newErrors.hospitalName = "Vui lòng nhập tên bệnh viện";
    if (!phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!validatePhone(phone)) newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      setErrorMessage("MS25: Tài khoản đã tồn tại");
      return;
    }

    const newPartner = {
      email,
      password,
      role: "hospital",
      status: "pending",
      hospitalName,
      representative,
      address,
      taxCode,
      phone,
      note,
      createdAt: new Date().toISOString(),
    };
    users.push(newPartner);
    saveUsers(users);

    setSuccessMessage("MS01: Đăng ký tài khoản thành công! Vui lòng chờ xác thực.");
    setErrorMessage("");

    setTimeout(() => {
      window.location.href = "/partner-login";
    }, 2000);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-[40px] px-[16px] bg-gray-50">
        <div className="w-full max-w-[520px] bg-white rounded-[16px] shadow-lg p-[40px]">
          <div className="text-center mb-[32px]">
            <div className="w-[60px] h-[60px] bg-red-600 rounded-full flex items-center justify-center mx-auto mb-[16px]">
              <FontAwesomeIcon icon={faHospital} className="text-white text-[28px]" />
            </div>
            <h1 className="text-[28px] font-bold text-gray-900">Đăng Ký Đối Tác</h1>
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
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hospital@example.com"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[13px] mt-[6px]">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-[13px] mt-[6px]">{errors.password}</p>}
              <p className="text-gray-400 text-[12px] mt-[4px]">Ít nhất 8 ký tự, bao gồm chữ và số</p>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Xác nhận mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[13px] mt-[6px]">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Tên bệnh viện <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Bệnh viện Chợ Rẫy"
                className={`w-full px-[14px] py-[12px] border ${
                  errors.hospitalName ? "border-red-500" : "border-gray-300"
                } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.hospitalName && <p className="text-red-500 text-[13px] mt-[6px]">{errors.hospitalName}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Người đại diện
              </label>
              <input
                type="text"
                name="representative"
                value={formData.representative}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-[14px] py-[12px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Địa chỉ bệnh viện <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="201B Nguyễn Chí Thanh, Q.5, TP.HCM"
                className={`w-full px-[14px] py-[12px] border ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.address && <p className="text-red-500 text-[13px] mt-[6px]">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Mã số thuế
              </label>
              <input
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                placeholder="0123456789"
                className="w-full px-[14px] py-[12px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0901234567"
                className={`w-full px-[14px] py-[12px] border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.phone && <p className="text-red-500 text-[13px] mt-[6px]">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-[6px]">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Thông tin thêm..."
                className="w-full px-[14px] py-[12px] border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition shadow-md"
            >
              Đăng Ký Đối Tác
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