import { useState } from 'react';
import '../index.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';

const Layout = ({ children, searchTerm, setSearchTerm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 shadow-md">
        <nav className="bg-black text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              
              {/* Nút Hamburger cho Mobile */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Logo & Navigation Desktop */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                {/* Logo BloodLink */}
                <a href="/homepage" className="flex items-center gap-2 font-bold text-xl text-red-600 mr-4">
                  <FontAwesomeIcon icon={faDroplet} style={{color: "rgb(255, 0, 0)",}} /><span>BloodLink</span>
                </a>

                {/* Menu desktop */}
                <div className="hidden sm:ml-4 sm:block">
                  <div className="flex space-x-2">
                    <a href="/homepage" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                      Trang chủ
                    </a>

                    <a href="/ListTinKhancap" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white">
                      Tin khẩn cấp
                    </a>

                    <a href="/hospitals" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white">
                      Danh sách bệnh viện
                    </a>

                    {/* Dropdown Đăng ký Hiến / Nhận Máu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white inline-flex items-center gap-1"
                      >
                        Đăng ký dịch vụ ▾
                      </button>
                      {isCategoryMenuOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                          <a href="/register-donate" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Đăng ký hiến máu
                          </a>
                          <a href="/register-receive" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Đăng ký nhận máu
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ô TÌM KIẾM (SEARCH BAR) */}
              <div className="flex items-center px-2 sm:ml-6">
                <div className="w-full max-w-lg sm:max-w-xs relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    type="search"
                    maxLength={255}
                    placeholder="Tìm nhóm máu, bệnh viện..."
                    value={searchTerm || ''}
                    onChange={(e) => {
                      if (setSearchTerm) setSearchTerm(e.target.value);
                    }}
                    className="block w-full rounded-md border-0 bg-gray-900 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* TÀI KHOẢN / PROFILE */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-4 sm:pr-0">
                {localStorage.getItem('userToken') ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex rounded-full bg-red-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                        alt="User profile"
                        className="w-8 h-8 rounded-full"
                      />
                    </button>

                    {isProfileMenuOpen && (
                      <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                        <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Thông tin tài khoản
                        </a>
                        <button
                          onClick={() => {
                            localStorage.removeItem('userToken');
                            window.location.reload();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href="/login"
                    className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                  >
                    Đăng nhập
                  </a>
                )}
              </div>

            </div>
          </div>

          {/* MENU MOBILE SLIDE DOWN */}
          {isMobileMenuOpen && (
            <div className="sm:hidden bg-gray-900 px-2 pt-2 pb-3 space-y-1">
              <a href="/homepage" className="block rounded-md bg-gray-800 px-3 py-2 text-base font-medium text-white">
                Trang chủ
              </a>
              <a href="/ListTinKhancap" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                Tin khẩn cấp
              </a>
              <a href="/hospitals" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                Danh sách bệnh viện
              </a>
              <a href="/register-donate" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                Đăng ký hiến máu
              </a>
              <a href="/register-receive" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                Đăng ký nhận máu
              </a>
            </div>
          )}
        </nav>
      </header>

      {/* BODY NỘI DUNG CHÍNH */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;