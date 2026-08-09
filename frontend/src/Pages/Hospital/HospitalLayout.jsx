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

  const handleUrgentNewsAction = (e) => {
    if (e) e.preventDefault();
    if (typeof onOpenCreateModal === 'function') {
      onOpenCreateModal();
      return;
    }

    window.location.href = '/hospital/emergency';
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
      <header className="sticky top-0 z-50 bg-black text-white shadow-md">
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            <button 
              onClick={(e) => handleNavigate('/hospital-dashboard', e)} 
              className="flex items-center gap-2 font-bold text-xl text-red-600 mr-4"
            >
              <FontAwesomeIcon icon={faDroplet} className="text-red-600" />
              <span>BloodLink</span>
            </button>

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

            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={handleUrgentNewsAction}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(220,38,38,0.22)] transition duration-200 hover:-translate-y-0.5 hover:from-red-500 hover:to-rose-500 hover:shadow-[0_14px_26px_rgba(220,38,38,0.28)] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                <FontAwesomeIcon icon={faBullhorn} />
                Đăng tin khẩn cấp
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                    className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span className="hidden sm:inline">{hospitalName}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-[0_18px_40px_rgba(0,0,0,0.14)] z-10 text-sm">
                      <button 
                        onClick={handleLogout} 
                        className="block w-full px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
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
            onClick={(e) => { 
              handleUrgentNewsAction(e);
              setIsMobileMenuOpen(false);
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
      <footer className="mt-auto w-full bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-gray-300 sm:px-6 lg:grid-cols-[1.2fr_1fr_1.2fr] lg:px-8 lg:text-base">
          <div>
            <h3 className="mb-3 text-lg font-semibold uppercase tracking-wide text-white">Đăng ký</h3>
            <ul className="space-y-2">
              <li><button onClick={(e) => handleNavigate('/register-donate', e)} className="text-left transition hover:text-red-500">Đăng ký hiến máu</button></li>
              <li><button onClick={(e) => handleNavigate('/partner-login', e)} className="text-left transition hover:text-red-500">Đăng ký bệnh viện</button></li>
              <li><button onClick={(e) => handleNavigate('/register-receive', e)} className="text-left transition hover:text-red-500">Đăng ký nhận máu</button></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold uppercase tracking-wide text-white">Công ty</h3>
            <ul className="space-y-2">
              <li><button onClick={(e) => handleNavigate('/about', e)} className="text-left transition hover:text-red-500">Về chúng tôi</button></li>
              <li><button onClick={(e) => handleNavigate('/contact', e)} className="text-left transition hover:text-red-500">Liên hệ</button></li>
              <li><button onClick={(e) => handleNavigate('/terms', e)} className="text-left transition hover:text-red-500">Điều khoản</button></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center rounded-lg bg-zinc-900 p-3 sm:justify-start">
              <img src={footerImgNew} alt="Blood donation illustration" className="h-28 w-full max-w-[220px] object-contain" />
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-500">Lợi ích của hiến máu</h4>
              <p className="text-sm leading-6 text-gray-300">
                Hiến máu là hành động nhân văn giúp cứu sống người bệnh và tạo nên một cộng đồng sẻ chia, kịp thời trong các tình huống khẩn cấp.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full bg-red-900 py-3 text-center text-sm font-semibold tracking-wide text-white">
          Hà Vũ Hồng Phúc - Lu Tùng Quy - Trương Gia Tân
        </div>
      </footer>
    </div>
  );
};

export default HospitalLayout;