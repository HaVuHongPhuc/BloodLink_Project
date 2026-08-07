import { useState, useEffect } from 'react';
import '../../index.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import footerImgNew from '../HinhAnh,icons/footer.png';

const HospitalLayout = ({ children, searchTerm = '', setSearchTerm, onOpenCreateModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.pathname.toLowerCase());
  }, []);

  const isLoggedIn = !!localStorage.getItem('userToken');

  // Hàm điều hướng trực tiếp bằng URL thuần
  const handleNavigate = (path, e) => {
    if (e) e.preventDefault();
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER / NAVBAR CHO BỆNH VIỆN */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-md">
        <nav className="w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <div className="relative flex h-[64px] items-center justify-between">
            
            {/* Nút Hamburger (Mobile) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-[8px] text-gray-400 hover:text-white"
            >
              <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* KHỐI TRÁI: Logo & Navigation */}
            <div className="flex items-center space-x-[8px] flex-shrink-0">
              <button 
                type="button" 
                onClick={(e) => handleNavigate('/hospital', e)} 
                className="flex items-center gap-[8px] font-bold text-[20px] text-red-600 mr-[16px]"
              >
                <FontAwesomeIcon icon={faDroplet} className="text-red-600" />
                <span>BloodLink</span>
              </button>

              <div className="hidden lg:flex space-x-[4px] text-[14px] font-medium">
                <button 
                  type="button"
                  onClick={(e) => handleNavigate('/hospital', e)} 
                  className={`px-[12px] py-[8px] rounded-[6px] transition-colors ${currentUrl === '/hospital' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  Trang chủ
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleNavigate('/listtinkhancap', e)} 
                  className={`px-[12px] py-[8px] rounded-[6px] transition-colors ${currentUrl === '/listtinkhancap' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  Tin khẩn cấp
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleNavigate('/hospitals', e)} 
                  className={`px-[12px] py-[8px] rounded-[6px] transition-colors ${currentUrl === '/hospitals' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  Danh sách bệnh viện
                </button>
              </div>
            </div>

            {/* KHỐI GIỮA: Ô Tìm Kiếm */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[300px] lg:max-w-[400px]">
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
                  className="w-full rounded-[6px] py-[8px] pl-[36px] pr-[12px] text-[14px] text-white placeholder:text-gray-600 bg-gray-900 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none transition-colors border border-gray-800"
                />
              </div>
            </div>

            {/* KHỐI PHẢI: NÚT ĐĂNG TIN KHẨN CẤP & ĐĂNG NHẬP */}
            <div className="flex items-center space-x-[12px] flex-shrink-0">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof onOpenCreateModal === 'function') {
                    onOpenCreateModal();
                  }
                }}
                className="hidden sm:flex items-center gap-[6px] bg-red-600 hover:bg-red-700 text-white font-bold py-[8px] px-[14px] rounded-[6px] text-[13px] transition shadow-sm uppercase whitespace-nowrap cursor-pointer"
              >
                <FontAwesomeIcon icon={faBullhorn} />
                Đăng tin khẩn cấp
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                    className="flex rounded-full bg-red-600"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="User profile" className="w-[32px] h-[32px] rounded-full" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-[8px] w-[192px] bg-white text-gray-700 rounded-[6px] shadow-lg py-[4px] z-10 text-[14px]">
                      <button type="button" onClick={(e) => handleNavigate('/profile', e)} className="block w-full text-left px-[16px] py-[8px] hover:bg-gray-100">Thông tin tài khoản</button>
                      <button
                        type="button"
                        onClick={() => { localStorage.removeItem('userToken'); window.location.reload(); }}
                        className="block w-full text-left px-[16px] py-[8px] text-red-600 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button type="button" onClick={(e) => handleNavigate('/login', e)} className="px-[12px] py-[6px] text-[13px] font-medium text-white bg-gray-900 rounded-[6px] hover:bg-gray-800 transition border border-gray-700">
                    Đăng nhập
                  </button>
                  <button type="button" onClick={(e) => handleNavigate('/partner-login', e)} className="px-[12px] py-[6px] text-[13px] font-medium text-white bg-red-600 rounded-[6px] hover:bg-red-700 transition shadow-sm">
                    Đăng nhập bệnh viện
                  </button>
                </>
              )}
            </div>

          </div>
        </nav>
      </header>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 px-[16px] py-[12px] space-y-[8px] text-[14px] text-gray-300">
          <button type="button" onClick={(e) => handleNavigate('/hospital', e)} className="block w-full text-left text-white font-medium">Trang chủ</button>
          <button type="button" onClick={(e) => handleNavigate('/listtinkhancap', e)} className="block w-full text-left hover:text-white">Tin khẩn cấp</button>
          <button type="button" onClick={(e) => handleNavigate('/hospitals', e)} className="block w-full text-left hover:text-white">Danh sách bệnh viện</button>
          <button 
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (typeof onOpenCreateModal === 'function') onOpenCreateModal();
            }}
            className="w-full text-left text-red-500 font-bold pt-[4px]"
          >
            Đăng tin khẩn cấp
          </button>
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
              <li><button type="button" onClick={(e) => handleNavigate('/register-donate', e)} className="hover:text-red-500 transition-colors text-left">Donor Signup</button></li>
              <li><button type="button" onClick={(e) => handleNavigate('/partner-login', e)} className="hover:text-red-500 transition-colors text-left">Hospital Signup</button></li>
              <li><button type="button" onClick={(e) => handleNavigate('/register-receive', e)} className="hover:text-red-500 transition-colors text-left">Blood Recipient Signup</button></li>
            </ul>
          </div>

          <div className="w-[128px] h-[140px] flex flex-col justify-between flex-shrink-0">
            <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">COMPANY</h3>
            <ul className="space-y-[10px] text-[14px] text-gray-300">
              <li><button type="button" onClick={(e) => handleNavigate('/about', e)} className="hover:text-red-500 transition-colors text-left">About Us</button></li>
              <li><button type="button" onClick={(e) => handleNavigate('/contact', e)} className="hover:text-red-500 transition-colors text-left">Contact Us</button></li>
              <li><button type="button" onClick={(e) => handleNavigate('/terms', e)} className="hover:text-red-500 transition-colors text-left">Term of Services</button></li>
            </ul>
          </div>

          <div className="w-[315px] h-[330px] flex items-center justify-center flex-shrink-0">
            <img src={footerImgNew} alt="A Blood Donor Saved My Life" className="w-full h-full object-contain" />
          </div>

          <div className="w-[640px] h-[210px] flex flex-col justify-start flex-shrink-0 text-left">
            <h4 className="text-[15px] font-bold text-red-600 mb-[4px]">Benefits of Blood Donation</h4>
            <h2 className="text-[24px] font-bold text-white mb-[12px]">Save Lives, Be a Real Hero</h2>
            <p className="text-[13px] text-gray-300 leading-[1.6] text-justify">
              Donating blood is a noble act that not everyone can do. With advancements in
              medicine, the need for blood has increased threefold since the industrial revolution.
              Every year, India has a deficit of between 30% and 35%. It is absurd to say that the
              country cannot meet this requirement with 1.2 billion people. The real challenge
              is not the lack of blood donors, but finding someone willing to donate when needed.
              Therefore, the aim should be to create a system of people who can help each other
              in emergencies.
            </p>
          </div>
        </div>

        <div className="w-full bg-red-900 py-[12px] text-center text-white font-bold text-[15px] tracking-wide">
          Hà Vũ Hồng Phúc - Lưu Tùng Quy - Trương Gia Tân
        </div>
      </footer>
    </div>
  );
};

export default HospitalLayout;