  import { useState } from 'react';
  import '../index.css';

  const Layout = ({ children,searchTerm, setSearchTerm }) => {
    // Tạo state để quản lý việc mở/đóng menu trên mobile và dropdown profile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

    return (
      <div>
        <header>
          <nav className="relative bg-black">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* <!-- Mobile menu button--> */}
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
                  >
                    <span className="absolute -inset-0.5"></span>
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-6">
                        <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-6">
                        <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      <a href="/homepage" aria-current="page" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">Trang chủ</a>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                          className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                          Thể loại phim
                        </button>
                        {isCategoryMenuOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-black py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                        <a href="/hanhdong" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Hành động</a>
                        <a href="/Kinhdi" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Kinh dị</a>
                        </div>
                          )}
                      </div>
                      <a href="/anime" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Anime</a>
                      <a href="/trailer" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Phim sắp ra mắt</a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center px-2 sm:ml-6 sm:justify-end">
                  <div className="w-full max-w-lg sm:max-w-xs">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        {/* Icon kính lúp */}
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {/* Ô nhập liệu */}
                      <input 
                        id="search" 
                        name="search" 
                        type="search" 
                        maxLength={255}
                        placeholder="Tìm kiếm..." 
                        value={searchTerm} // Giá trị lấy từ kho
                        // Khi gõ chữ báo về cho HomePage
                        onChange={(e) => {
                        // Cần kiểm tra xem setSearchTerm có tồn tại không để tránh lỗi ở các trang không có tính năng tìm kiếm
                        if(setSearchTerm) setSearchTerm(e.target.value); 
                        }}
                        className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-colors duration-200" 
                      />
                    </div>
                  </div>
                  
                </div>
                <div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/*Profile dropdown*/}
                  <div className="relative shrink-0">
                    
                    {/* Kiểm tra xem có Token đăng nhập chưa */}
                    {localStorage.getItem('userToken') ? (
                      // NẾU ĐÃ ĐĂNG NHẬP: Avatar Profile
                      <div>
                        <button 
                          type="button"
                          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                          className="relative flex rounded-full bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="User profile" className="w-8 h-8 outline outline-white/10 rounded-full -outline-offset-1" />
                        </button>

                        {/* Menu xổ xuống khi bấm vào Avatar */}
                        {isProfileMenuOpen && (
                          <div className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thông tin tài khoản</a>
                            <button 
                              onClick={() => {
                                localStorage.removeItem('userToken'); // Xóa vé
                                window.location.reload(); 
                              }}
                              className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                            >
                              Đăng xuất
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // NẾU CHƯA ĐĂNG NHẬP: Hiện nút "Đăng nhập"
                      <a
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-white transition bg-red-600 rounded-md hover:bg-red-700"
                      >Đăng nhập
                      </a>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
            {isMobileMenuOpen && (
              <div id="mobile-menu" className="block sm:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3">
                  <a href="/homepage" aria-current="page" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white">Trang chủ</a>
                  <button
                          type="button"
                          onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                          className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                          Thể loại phim
                        </button>
                        {isCategoryMenuOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-600 py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                        <a href="/hanhdong" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Hành động</a>
                        <a href="/Kinhdi" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Kinh dị</a>
                        </div>
                          )}
                  <a href="/anime" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Anime</a>
                  <a href="#!" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white">Phim sắp chiếu</a>
                </div>
              </div>
            )}
          </nav>
        </header>
        <main>
          {children}
        </main>
      </div>
    );
  };

  export default Layout;