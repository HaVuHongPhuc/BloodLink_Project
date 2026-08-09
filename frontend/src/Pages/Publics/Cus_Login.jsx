import { useState } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Cus_Login = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { identifier, password } = formData;
    const newErrors = {};

    if (!identifier) newErrors.identifier = "Vui lòng nhập email hoặc mã tài khoản";
    else if (!validateEmail(identifier)) newErrors.identifier = "Vui lòng nhập đúng email hoặc mã tài khoản";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/dang-nhap-khach-hang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          MatKhau: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Đăng nhập thất bại");
        return;
      }

      setSuccessMessage(data.message || "Đăng nhập thành công");
      setErrorMessage("");
      
      // 🟢 LƯU TOKEN VÀ ROLE
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userRole", data.user?.role || "customer");
      localStorage.setItem("userEmail", data.user?.email || identifier);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("✅ Đăng nhập thành công, role:", data.user?.role);

      setTimeout(() => {
        const role = data.user?.role || "customer";
        if (role === "quan tri he thong") {
          console.log("🔀 Chuyển đến /admin");
          window.location.href = "/admin";
        } else {
          console.log("🔀 Chuyển đến /homepage");
          window.location.href = "/homepage";
        }
      }, 1500);

    } catch (error) {
      setErrorMessage("Không thể kết nối tới máy chủ. Hãy kiểm tra backend.");
      console.error("Login error:", error);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        <div className="w-full max-w-[440px] rounded-[16px] bg-white p-4 shadow-lg sm:p-6 lg:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-red-600 sm:h-[60px] sm:w-[60px]">
              <FontAwesomeIcon icon={faSignInAlt} className="text-[24px] text-white sm:text-[28px]" />
            </div>
            <h1 className="text-[24px] font-bold text-gray-900 sm:text-[28px]">Đăng Nhập</h1>
            <p className="mt-2 text-[13px] text-gray-500 sm:text-[14px]">Chào mừng bạn quay trở lại</p>
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
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Email hoặc mã tài khoản"
                  className={`w-full pl-[40px] pr-[14px] py-[12px] border ${
                    errors.identifier ? "border-red-500" : "border-gray-300"
                  } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                />
              </div>
              {errors.identifier && <p className="text-red-500 text-[13px] mt-[6px]">{errors.identifier}</p>}
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
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition duration-200 shadow-md hover:shadow-lg"
            >
              Đăng Nhập
            </button>
          </form>

          <div className="mt-[24px] text-center space-y-[12px]">
            <p className="text-gray-600 text-[14px]">
              Chưa có tài khoản?{" "}
              <a href="/register" className="text-red-600 font-semibold hover:underline">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cus_Login;