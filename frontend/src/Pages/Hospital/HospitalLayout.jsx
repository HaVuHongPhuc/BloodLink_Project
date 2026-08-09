import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDroplet, 
  faBullhorn, 
  faSearch, 
  faBell, 
  faUser, 
  faSignOutAlt,
  faTint,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import footerImgNew from '../HinhAnh,icons/footer.png';

const HospitalLayout = ({ children, onOpenCreateModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.pathname.toLowerCase());
  }, []);

  const isLoggedIn = !!localStorage.getItem('userToken');
  const hospitalName = localStorage.getItem('hospitalName') || 'Bệnh viện';

  const handleNavigate = (path, e) => {
    if (e) e.preventDefault();
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('maBenhVien');
    localStorage.removeItem('hospitalName');
    window.location.href = '/partner-login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-md">
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            
            {/* Hamburger */}
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Logo */}
            <button 
              onClick={(e) => handleNavigate('/hospital-dashboard', e)} 
              className="flex items-center gap-2 font-bold text-xl text-red-600 mr-4"
            >
              <FontAwesomeIcon icon={faDroplet} className="text-red-600" />
              <span>BloodLink</span>
            </button>

            {/* Navigation - menu bệnh viện */}
            <div className="hidden lg:flex space-x-1 text-sm font-medium">
              <button 
                onClick={(e) => handleNavigate('/hospital-dashboard', e)} 
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentUrl === '/hospital-dashboard' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Trang chủ
              </button>
              <button 
                onClick={(e) => handleNavigate('/hospital/emergency', e)} 
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentUrl.includes('/hospital/emergency') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Tin khẩn cấp
              </button>
              <button 
                onClick={(e) => handleNavigate('/hospital/search-donor', e)} 
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentUrl.includes('/hospital/search-donor') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Tìm người hiến
              </button>
              <button 
                onClick={(e) => handleNavigate('/hospital/notifications', e)} 
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentUrl.includes('/hospital/notifications') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Thông báo
              </button>
              <button 
                onClick={(e) => handleNavigate('/hospital/inventory', e)} 
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentUrl.includes('/hospital/inventory') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Kho máu
              </button>
              <button 
                onClick={(e) => handleNavigate('/hospital/orders', e)} 
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentUrl.includes('/hospital/orders') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Đơn đăng ký
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* ✅ NÚT ĐĂNG TIN KHẨN CẤP - ĐÃ CÓ */}
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof onOpenCreateModal === 'function') {
                    onOpenCreateModal();
                  }
                }}
                className="hidden sm:flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md text-xs uppercase"
              >
                <FontAwesomeIcon icon={faBullhorn} />
                Đăng tin khẩn cấp
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                    className="flex items-center gap-2 rounded-full bg-red-600 text-white px-3 py-1 text-sm font-medium hover:bg-red-700"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span className="hidden sm:inline">{hospitalName}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg py-1 z-10 text-sm">
                      <button 
                        onClick={handleLogout} 
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={(e) => handleNavigate('/login', e)} 
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 border border-gray-700"
                  >
                    Đăng nhập
                  </button>
                  <button 
                    onClick={(e) => handleNavigate('/register', e)} 
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-sm"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 px-4 py-3 space-y-2 text-sm text-gray-300">
          <button onClick={(e) => { handleNavigate('/hospital-dashboard', e); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white font-medium">Trang chủ</button>
          <button onClick={(e) => { handleNavigate('/hospital/emergency', e); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-white">Tin khẩn cấp</button>
          <button onClick={(e) => { handleNavigate('/hospital/search-donor', e); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-white">Tìm người hiến</button>
          <button onClick={(e) => { handleNavigate('/hospital/notifications', e); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-white">Thông báo</button>
          <button onClick={(e) => { handleNavigate('/hospital/inventory', e); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-white">Kho máu</button>
          <button onClick={(e) => { handleNavigate('/hospital/orders', e); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-white">Đơn đăng ký</button>
          {/* ✅ NÚT ĐĂNG TIN TRÊN MOBILE */}
          <button 
            onClick={() => { 
              setIsMobileMenuOpen(false);
              if (typeof onOpenCreateModal === 'function') onOpenCreateModal();
            }} 
            className="block w-full text-left text-red-500 font-bold pt-2 border-t border-gray-700"
          >
            Đăng tin khẩn cấp
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black text-white font-sans mt-auto">
        <div className="w-full max-w-7xl h-[350px] mx-auto px-[40px] flex items-center justify-between gap-[20px]">
          <div className="w-[175px] h-[140px] flex flex-col justify-between flex-shrink-0">
            <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">REGISTER</h3>
            <ul className="space-y-[10px] text-[14px] text-gray-300">
              <li><button onClick={(e) => handleNavigate('/register-donate', e)} className="hover:text-red-500 transition-colors text-left">Donor Signup</button></li>
              <li><button onClick={(e) => handleNavigate('/partner-login', e)} className="hover:text-red-500 transition-colors text-left">Hospital Signup</button></li>
              <li><button onClick={(e) => handleNavigate('/register-receive', e)} className="hover:text-red-500 transition-colors text-left">Blood Recipient Signup</button></li>
            </ul>
          </div>

          <div className="w-[128px] h-[140px] flex flex-col justify-between flex-shrink-0">
            <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">COMPANY</h3>
            <ul className="space-y-[10px] text-[14px] text-gray-300">
              <li><button onClick={(e) => handleNavigate('/about', e)} className="hover:text-red-500 transition-colors text-left">About Us</button></li>
              <li><button onClick={(e) => handleNavigate('/contact', e)} className="hover:text-red-500 transition-colors text-left">Contact Us</button></li>
              <li><button onClick={(e) => handleNavigate('/terms', e)} className="hover:text-red-500 transition-colors text-left">Term of Services</button></li>
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
          Hà Vũ Hồng Phúc - Lu Tùng Quy - Trương Gia Tân
        </div>
      </footer>
    </div>
  );
};

export default HospitalLayout;