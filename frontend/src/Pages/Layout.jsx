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
    <div className="min-h-screen overflow-x-hidden bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-md">
        <nav className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="relative flex min-h-[56px] items-center justify-between gap-2 py-2 sm:min-h-[64px] sm:py-0">
            {/* Nút Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex-shrink-0 p-2 text-gray-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Logo */}
            <a href="/homepage" className="mr-2 flex min-w-0 items-center gap-2 font-bold text-[18px] text-red-600 sm:text-[20px]">
              <FontAwesomeIcon icon={faDroplet} className="text-red-600" />
              <span className="truncate">BloodLink</span>
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
            <div className="flex flex-shrink-0 items-center gap-2">
              {isLoggedIn ? (
                <div className="relative">
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex rounded-full bg-red-600">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="User profile" className="h-8 w-8 rounded-full sm:h-9 sm:w-9" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-[8px] w-[192px] bg-white text-gray-700 rounded-[6px] shadow-lg py-[4px] z-10 text-[14px]">
                      {/* ✅ CHỈ HIỂN THỊ HỒ SƠ KHI KHÔNG PHẢI ADMIN */}
                      {userRole !== "quan tri he thong" && (
                        <>
                          <a href="/profile" className="block px-[16px] py-[8px] hover:bg-gray-100">Thông tin tài khoản</a>
                          {userRole === "hospital" && (
                            <a href="/hospital-profile" className="block px-[16px] py-[8px] hover:bg-gray-100">Hồ sơ bệnh viện</a>
                          )}
                        </>
                      )}
                      {/* ✅ ADMIN CHỈ THẤY ĐĂNG XUẤT, KHÔNG CÓ GÌ KHÁC */}
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
                  <a href="/login" className="rounded-[6px] bg-red-600 px-3 py-2 text-[13px] font-medium text-white transition hover:bg-red-700 sm:px-[12px] sm:py-[6px] sm:text-[14px]">
                    Đăng nhập
                  </a>
                  <a href="/partner-login" className="hidden rounded-[6px] border border-gray-600 px-3 py-2 text-[13px] font-medium text-gray-200 transition hover:bg-gray-800 sm:inline-flex sm:px-[12px] sm:py-[6px] sm:text-[14px]">
                    Đăng nhập tài khoản đối tác
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
              <a href="/partner-login" className="block text-blue-400 font-semibold">Đăng nhập tài khoản đối tác</a>
            </>
          )}
        </div>
      )}

      {/* BODY */}
      <main className="mx-auto flex-1 w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto w-full bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-gray-300 sm:px-6 sm:py-10 lg:grid-cols-3 lg:px-8 lg:text-base">
          <div>
            <div className="mb-3 flex items-center gap-2 font-semibold text-red-500">
              <FontAwesomeIcon icon={faDroplet} />
              <span>BloodLink</span>
            </div>
            <p className="leading-6 text-gray-400">
              Nền tảng kết nối người hiến máu, bệnh viện và cộng đồng để hỗ trợ kịp thời và an toàn.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold uppercase tracking-wide text-white">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="/homepage" className="transition hover:text-white">Trang chủ</a></li>
              <li><a href="/listtinkhancap" className="transition hover:text-white">Tin khẩn cấp</a></li>
              <li><a href="/hospitals" className="transition hover:text-white">Danh sách bệnh viện</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold uppercase tracking-wide text-white">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@bloodlink.vn</li>
              <li>Hotline: 1900 1234</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;