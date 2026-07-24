import { useState } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Hospital_Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getUsers = () => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : [];
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;
    const newErrors = {};

    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(email)) newErrors.email = "MS06: Vui lòng kiểm tra lại định dạng email";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.role === "hospital");

    if (!user) {
      setErrorMessage("MS08: Vui lòng đăng nhập bằng tài khoản đối tác");
      return;
    }

    if (user.password !== password) {
      setErrorMessage("MS07: Mật khẩu không đúng, Vui lòng thử lại");
      return;
    }

    if (user.status !== "approved") {
      setErrorMessage("Tài khoản đang chờ xác thực hoặc bị từ chối");
      return;
    }

    setSuccessMessage("MS05: Đăng nhập thành công");
    setErrorMessage("");
    localStorage.setItem("userToken", "fake-jwt-token");
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userEmail", user.email);

    setTimeout(() => {
      window.location.href = "/hospital-dashboard";
    }, 1500);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-[40px] px-[16px] bg-gray-50">
        <div className="w-full max-w-[440px] bg-white rounded-[16px] shadow-lg p-[40px]">
          <div className="text-center mb-[32px]">
            <div className="w-[60px] h-[60px] bg-red-600 rounded-full flex items-center justify-center mx-auto mb-[16px]">
              <FontAwesomeIcon icon={faSignInAlt} className="text-white text-[28px]" />
            </div>
            <h1 className="text-[28px] font-bold text-gray-900">Đăng Nhập Đối Tác</h1>
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
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-[14px] rounded-[8px] transition shadow-md"
            >
              Đăng Nhập
            </button>
          </form>

          <div className="mt-[24px] text-center space-y-[12px]">
            <p className="text-gray-600 text-[14px]">
              Chưa có tài khoản?{" "}
              <a href="/partner-register" className="text-red-600 font-semibold hover:underline">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hospital_Login;