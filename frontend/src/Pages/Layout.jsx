import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";

const Layout = ({ children, searchTerm = "", setSearchTerm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem("userToken");
  const userRole = localStorage.getItem("userRole");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-md">
        <nav className="w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="relative flex h-[64px] items-center justify-between">
            {/* Nút Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-[8px] text-gray-400 hover:text-white"
            >
              {/* ... icon hamburger ... */}
            </button>

            {/* Logo */}
            <a href="/homepage" className="flex items-center gap-[8px] font-bold text-[20px] text-red-600 mr-[16px]">
              <FontAwesomeIcon icon={faDroplet} className="text-red-600" />
              <span>BloodLink</span>
            </a>

            {/* Menu Desktop */}
            <div className="hidden lg:flex space-x-[4px] text-[14px] font-medium">
              <a href="/homepage" className="bg-gray-900 px-[12px] py-[8px] rounded-[6px]">Trang chủ</a>
              <a href="/listtinkhancap" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">Tin khẩn cấp</a>
              <a href="/hospitals" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">Danh sách bệnh viện</a>
              
              {/* Dropdown Đăng ký dịch vụ (ẩn với admin) */}
              {userRole !== "quan tri he thong" && (
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                    className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]"
                  >
                    Đăng ký dịch vụ ▾
                  </button>
                  {isCategoryMenuOpen && (
                    <div className="absolute left-0 mt-[8px] w-[192px] bg-white text-gray-700 rounded-[6px] shadow-lg py-[4px] z-10 text-[14px]">
                      <a href="/register-donate" className="block px-[16px] py-[8px] hover:bg-gray-100">Đăng ký hiến máu</a>
                      <a href="/register-receive" className="block px-[16px] py-[8px] hover:bg-gray-100">Đăng ký nhận máu</a>
                    </div>
                  )}
                </div>
              )}

              {/* Nếu là bệnh viện, hiển thị thêm menu bệnh viện */}
              {isLoggedIn && userRole === "hospital" && (
                <>
                  <a href="/hospital-dashboard" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">Dashboard</a>
                  <a href="/search-donor" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">Tìm người hiến</a>
                </>
              )}

              {/* Nếu là admin, hiển thị menu admin */}
              {isLoggedIn && userRole === "quan tri he thong" && (
                <a href="/admin" className="px-[12px] py-[8px] text-yellow-400 hover:bg-gray-800 rounded-[6px]">Quản trị</a>
              )}
            </div>

            {/* Ô tìm kiếm */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[450px]">
              {/* ... input tìm kiếm ... */}
            </div>

            {/* KHỐI PHẢI: Đăng nhập / Profile */}
            <div className="flex items-center space-x-[8px] flex-shrink-0">
              {isLoggedIn ? (
                <div className="relative">
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex rounded-full bg-red-600">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="User profile" className="w-[32px] h-[32px] rounded-full" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-[8px] w-[192px] bg-white text-gray-700 rounded-[6px] shadow-lg py-[4px] z-10 text-[14px]">
                      <a href="/profile" className="block px-[16px] py-[8px] hover:bg-gray-100">Thông tin tài khoản</a>
                      {userRole === "hospital" && (
                        <a href="/hospital-profile" className="block px-[16px] py-[8px] hover:bg-gray-100">Hồ sơ bệnh viện</a>
                      )}
                      <button
                        onClick={() => { 
                          localStorage.removeItem("userToken");
                          localStorage.removeItem("userRole");
                          localStorage.removeItem("userEmail");
                          localStorage.removeItem("maBenhVien");
                          window.location.href = "/login";
                        }}
                        className="block w-full text-left px-[16px] py-[8px] text-red-600 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a href="/login" className="px-[12px] py-[6px] text-[14px] font-medium text-white bg-red-600 rounded-[6px] hover:bg-red-700 transition">
                    Đăng nhập
                  </a>
                  <a href="/partner-login" className="px-[12px] py-[6px] text-[14px] font-medium text-gray-200 border border-gray-600 rounded-[6px] hover:bg-gray-800 transition">
                    Đăng nhập Bệnh viện
                  </a>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 px-[16px] py-[12px] space-y-[8px] text-[14px] text-gray-300">
          <a href="/homepage" className="block text-white font-medium">Trang chủ</a>
          <a href="/listtinkhancap" className="block hover:text-white">Tin khẩn cấp</a>
          <a href="/hospitals" className="block hover:text-white">Danh sách bệnh viện</a>
          {userRole !== "quan tri he thong" && (
            <>
              <a href="/register-donate" className="block hover:text-white">Đăng ký hiến máu</a>
              <a href="/register-receive" className="block hover:text-white">Đăng ký nhận máu</a>
            </>
          )}
          {isLoggedIn && userRole === "hospital" && (
            <>
              <a href="/hospital-dashboard" className="block hover:text-white">Dashboard</a>
              <a href="/search-donor" className="block hover:text-white">Tìm người hiến</a>
            </>
          )}
          {isLoggedIn && userRole === "quan tri he thong" && (
            <a href="/admin" className="block text-yellow-400">Quản trị</a>
          )}
          {!isLoggedIn && (
            <>
              <a href="/login" className="block text-red-400 font-semibold">Đăng nhập</a>
              <a href="/partner-login" className="block text-blue-400 font-semibold">Đăng nhập bệnh viện</a>
            </>
          )}
        </div>
      )}

      {/* BODY */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-[16px] sm:p-[24px] lg:p-[32px]">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-black text-white font-sans mt-auto">
        {/* ... footer ... */}
      </footer>
    </div>
  );
};

export default Layout;