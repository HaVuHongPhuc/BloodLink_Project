import { useState } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUserPlus } from "@fortawesome/free-solid-svg-icons";

const Cus_Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;
    const newErrors = {};

    // MS06: sai định dạng email
    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(email)) newErrors.email = "Vui lòng kiểm tra lại định dạng email";

    // MS02: sai định dạng mật khẩu
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (!validatePassword(password)) {
      newErrors.password = "Vui lòng nhập đúng trường dữ liệu";
    }

    // MS42: xác nhận mật khẩu không đúng
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password && confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không đúng. Vui lòng nhập lại";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/dang-ky-khach-hang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email.trim(),
          MatKhau: password,
          XacNhanMatKhau: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Đăng ký thất bại");
        return;
      }

      setSuccessMessage(data.message || "Đăng ký tài khoản thành công");
      setErrorMessage("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      setErrorMessage("Không thể kết nối tới máy chủ. Hãy kiểm tra backend.");
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <div className="w-full max-w-[440px] rounded-[16px] bg-white p-4 shadow-lg sm:p-6 lg:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-red-600 sm:h-[60px] sm:w-[60px]">
              <FontAwesomeIcon icon={faUserPlus} className="text-[24px] text-white sm:text-[28px]" />
            </div>
            <h1 className="text-[24px] font-bold text-gray-900 sm:text-[28px]">Đăng Ký</h1>
            <p className="mt-2 text-[13px] text-gray-500 sm:text-[14px]">Tạo tài khoản để bắt đầu</p>
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

          <form onSubmit={handleSubmit} className="space-y-[20px]">
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
                  placeholder="example@email.com"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
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
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
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
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[13px] mt-[6px]">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition duration-200 shadow-md hover:shadow-lg"
            >
              Đăng Ký
            </button>
          </form>

          <div className="mt-[24px] text-center space-y-[12px]">
            <p className="text-gray-600 text-[14px]">
              Đã có tài khoản?{" "}
              <a href="/login" className="text-red-600 font-semibold hover:underline">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cus_Register;