import { useState, useEffect } from 'react';
import '../index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';

const Layout = ({ children, searchTerm = '', setSearchTerm }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Kiểm tra phiên đăng nhập và vai trò
  const userToken = localStorage.getItem('userToken');
  const partnerToken = localStorage.getItem('partnerToken');
  const rawRole = (localStorage.getItem('userRole') || '').toLowerCase();

  const isLoggedIn = !!userToken || !!partnerToken;
  const isHospital = !!partnerToken || rawRole === 'benhvien' || rawRole === 'hospital';

  // Chặn điều hướng nhầm trang cho Bệnh viện
  useEffect(() => {
    const currentPath = window.location.pathname;

    // 1. Nếu là Bệnh viện mà vào nhầm các trang của Khách hàng -> Tự động chuyển về Dashboard Bệnh viện
    const customerRoutes = ['/homepage', '/Cus_Profile', '/register-donate', '/register-receive'];
    if (isHospital && customerRoutes.includes(currentPath)) {
      window.location.replace('/hospital-dashboard');
      return;
    }

    // 2. Nếu không phải Bệnh viện mà truy cập vào đường dẫn /hospital/* -> Tự động chuyển về homepage Khách hàng
    if (!isHospital && currentPath.startsWith('/hospital')) {
      window.location.replace('/homepage');
      return;
    }
  }, [isHospital]);

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('maBenhVien');

    if (isHospital) {
      window.location.href = '/partner-login';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-md">
        <nav className="w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="relative flex h-[64px] items-center justify-between">
            
            {/* Nút Hamburger (Mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-[8px] text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* KHỐI TRÁI: Logo & Navigation */}
            <div className="flex items-center space-x-[8px] flex-shrink-0">
              <a href={isHospital ? "/hospital-dashboard" : "/homepage"} className="flex items-center gap-[8px] font-bold text-[20px] text-red-600 mr-[16px]">
                <FontAwesomeIcon icon={faDroplet} className="text-red-600" />
                <span>BloodLink</span>
              </a>

              <div className="hidden lg:flex space-x-[4px] text-[14px] font-medium">
                <a href={isHospital ? "/hospital-dashboard" : "/homepage"} className="bg-gray-900 px-[12px] py-[8px] rounded-[6px]">
                  Trang chủ
                </a>

                {isHospital ? (
                  <>
                    <a href="/hospital/emergency" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">
                      Tin khẩn cấp
                    </a>
                    <a href="/hospital/search-donor" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">
                      Tìm người hiến
                    </a>

                    {/* BỔ SUNG 2 THẺ NÀY ĐỂ HIỂN THỊ ĐỦ TRÊN HEADER */}
                    <a href="/hospital/orders" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">
                      Danh sách đơn
                    </a>
                    <a href="/hospital/inventory" className="px-[12px] py-[8px] text-red-500 font-bold bg-gray-900 hover:bg-gray-800 rounded-[6px]">
                      Kho máu
                    </a>

                    <a href="/hospital/notifications" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">
                      Thông báo
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/ListTinKhancap" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">
                      Tin khẩn cấp
                    </a>
                    <a href="/hospitals" className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]">
                      Danh sách bệnh viện
                    </a>
                    
                    <div className="relative">
                      <button
                        onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                        className="px-[12px] py-[8px] text-gray-300 hover:bg-gray-800 hover:text-white rounded-[6px]"
                      >
                        Đăng ký dịch vụ
                      </button>
                      {isCategoryMenuOpen && (
                        <div className="absolute left-0 mt-[8px] w-[192px] bg-white text-gray-700 rounded-[6px] shadow-lg py-[4px] z-10 text-[14px]">
                          <a href="/register-donate" className="block px-[16px] py-[8px] hover:bg-gray-100">Đăng ký hiến máu</a>
                          <a href="/register-receive" className="block px-[16px] py-[8px] hover:bg-gray-100">Đăng ký nhận máu</a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* KHỐI GIỮA: Ô Tìm Kiếm */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[450px]">
              <div className="w-full relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[12px]">
                  <svg className="h-[16px] w-[16px] text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  placeholder="Tìm nhóm máu, bệnh viện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                  className="w-full rounded-[6px] py-[8px] pl-[36px] pr-[12px] text-[14px] text-white placeholder:text-gray-500 bg-gray-900 border border-gray-800 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* KHỐI PHẢI: Tài khoản */}
            <div className="flex items-center space-x-[8px] flex-shrink-0">
              {isLoggedIn ? (
                <div className="relative">
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex rounded-full bg-red-600 p-0.5">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="User profile" className="w-[32px] h-[32px] rounded-full" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-[8px] w-[192px] bg-white text-gray-700 rounded-[6px] shadow-lg py-[4px] z-10 text-[14px]">
                      <a href={isHospital ? "/hospital-dashboard" : "/Cus_Profile"} className="block px-[16px] py-[8px] hover:bg-gray-100 font-medium">
                        {isHospital ? "Dashboard Bệnh viện" : "Thông tin tài khoản"}
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-[16px] py-[8px] text-red-600 hover:bg-gray-100 font-medium"
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
          <a href={isHospital ? "/hospital-dashboard" : "/homepage"} className="block text-white font-medium">Trang chủ</a>
          {isHospital ? (
            <>
              <a href="/hospital/emergency" className="block hover:text-white">Tin khẩn cấp</a>
              <a href="/hospital/search-donor" className="block hover:text-white">Tìm người hiến</a>
              <a href="/hospital/orders" className="block hover:text-white">Danh sách đơn</a>
              <a href="/hospital/inventory" className="block text-red-400 font-bold">Kho máu</a>
              <a href="/hospital/notifications" className="block hover:text-white">Thông báo</a>
            </>
          ) : (
            <>
              <a href="/ListTinKhancap" className="block hover:text-white">Tin khẩn cấp</a>
              <a href="/HospitalList" className="block hover:text-white">Danh sách bệnh viện</a>
              <a href="/register-donate" className="block hover:text-white">Đăng ký hiến máu</a>
              <a href="/register-receive" className="block hover:text-white">Đăng ký nhận máu</a>
            </>
          )}
        </div>
      )}

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-[16px] sm:p-[24px] lg:p-[32px]">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-black text-white font-sans mt-auto">
        <div className="w-full max-w-[1600px] h-[350px] mx-auto px-[40px] flex items-center justify-between gap-[20px]">
          <div className="w-[175px] h-[140px] flex flex-col justify-between flex-shrink-0">
            <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">REGISTER</h3>
            <ul className="space-y-[10px] text-[14px] text-gray-300">
              <li>
                <a href="/register-donate" className="hover:text-red-500 transition-colors">Donor Signup</a>
              </li>
              <li>
                <a href="/partner-login" className="hover:text-red-500 transition-colors">Hospital Signup</a>
              </li>
              <li>
                <a href="/register-receive" className="hover:text-red-500 transition-colors">Blood Recipient Signup</a>
              </li>
            </ul>
          </div>

          <div className="w-[128px] h-[140px] flex flex-col justify-between flex-shrink-0">
            <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">COMPANY</h3>
            <ul className="space-y-[10px] text-[14px] text-gray-300">
              <li><a href="/about" className="hover:text-red-500 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-red-500 transition-colors">Contact Us</a></li>
              <li><a href="/terms" className="hover:text-red-500 transition-colors">Term of Services</a></li>
            </ul>
          </div>

          <div className="w-[315px] h-[330px] flex items-center justify-center flex-shrink-0">
            <img src={require('./HinhAnh,icons/footer.png')} alt="A Blood Donor Saved My Life" className="w-full h-full object-contain" />
          </div>

          <div className="w-[640px] h-[210px] flex flex-col justify-start flex-shrink-0 text-left">
            <h4 className="text-[15px] font-bold text-red-600 mb-[4px]">Benefits of Blood Donation</h4>
            <h2 className="text-[24px] font-bold text-white mb-[12px]">Save Lives, Be a Real Hero</h2>
            <p className="text-[13px] text-gray-300 leading-[1.6] text-justify">
              Donating blood is a noble act that not everyone can do. With advancements in medicine, the need for blood has increased threefold since the industrial revolution. Every year, India has a deficit of between 30% and 35%. It is absurd to say that the country cannot meet this requirement with 1.2 billion people. The real challenge is not the lack of blood donors, but finding someone willing to donate when needed.
            </p>
          </div>
        </div>

        <div className="w-full bg-red-900 py-[12px] text-center text-white font-bold text-[15px] tracking-wide">
          Hà Vũ Hồng Phúc - Lu Tùng Quy - Trương Gia Tân
        </div>
      </footer>
    </div>
  );
};

export default Layout;