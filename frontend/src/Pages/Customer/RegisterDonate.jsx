import { useState, useEffect } from "react";
import Layout from "../Layout";

const RegisterDonate = () => {
  const [loading, setLoading] = useState(true);

  // State tách họ tên làm 3 ô input hiển thị
  const [nameParts, setNameParts] = useState({ firstName: '', midName: '', lastName: '' });

  // State lưu dữ liệu form khớp 100% với Model BloodDonation
  const [formData, setFormData] = useState({
    maDon: '',
    HovaTen: '',
    GioiTinh: 'Nam',
    DayofBirth: '',
    CCCDorPASSPORT: '',
    NgheNghiep: '',
    addressOnCCCD: '',
    CurrentResidence: '',
    PhoneNumber: '',
    Email: '',
    NhomMau: '',
    NgayHienGanNhat: '',
    UnderlyingMedicalCondition_Optional: '',
    TrangThaiDon: 'Cho_Duyet'
  });

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ open: false, message: '', type: 'error' });

  const showModal = (message, type = 'error') => {
    setModal({ open: true, message, type });
  };

  const closeModal = () => {
    setModal({ open: false, message: '', type: 'error' });
  };

  // 1. TRUY VẤN DỮ LIỆU TỪ DB KHI LOAD TRANG (Autofill từ User Profile)
  useEffect(() => {
    const fetchUserProfileFromDB = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.data) {
          const user = result.data;

          const nameArray = (user.HovaTen || user.fullName || '').trim().split(' ');
          const lastName = nameArray[0] || '';
          const firstName = nameArray.length > 1 ? nameArray[nameArray.length - 1] : '';
          const midName = nameArray.slice(1, -1).join(' ') || '';

          setNameParts({ firstName, midName, lastName });

          setFormData((prev) => ({
            ...prev,
            maDon: `DK${Date.now().toString().slice(-8)}`,
            HovaTen: user.HovaTen || user.fullName || '',
            GioiTinh: user.GioiTinh || 'Nam',
            DayofBirth: user.DayofBirth ? new Date(user.DayofBirth).toISOString().split('T')[0] : '',
            CCCDorPASSPORT: user.CCCDorPASSPORT || user.SoCCCD || '',
            NgheNghiep: user.NgheNghiep || '',
            addressOnCCCD: user.addressOnCCCD || user.address || '',
            CurrentResidence: user.CurrentResidence || user.address || '',
            PhoneNumber: user.PhoneNumber || user.phone || '',
            Email: user.Email || user.email || '',
            NhomMau: user.NhomMau || user.bloodType || 'Chua_Biet',
            NgayHienGanNhat: user.NgayHienGanNhat ? new Date(user.NgayHienGanNhat).toISOString().split('T')[0] : '',
            UnderlyingMedicalCondition_Optional: user.UnderlyingMedicalCondition_Optional || ''
          }));
        }
      } catch (error) {
        console.error('Không thể tải thông tin từ Database:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileFromDB();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...nameParts, [name]: value };
    setNameParts(updated);

    const full = `${updated.lastName} ${updated.midName} ${updated.firstName}`.replace(/\s+/g, ' ').trim();
    setFormData((prev) => ({ ...prev, HovaTen: full }));
  };

  const checkIs18Plus = (dobString) => {
    if (!dobString) return false;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  };

  // 2. GỬI ĐƠN ĐĂNG KÝ VỀ BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    let err = {};

    if (!formData.HovaTen) err.HovaTen = 'Vui lòng nhập đầy đủ họ và tên';
    else if (/\d/.test(formData.HovaTen)) err.HovaTen = 'Họ tên chỉ chứa ký tự chữ, không chứa chữ số';

    if (!formData.DayofBirth) err.DayofBirth = 'Vui lòng chọn ngày sinh';
    else if (!checkIs18Plus(formData.DayofBirth)) err.DayofBirth = 'Người hiến máu phải từ đủ 18 tuổi trở lên';

    const cccdRegex = /^([0-9]{12}|[A-Za-z0-9]{9})$/;
    if (!cccdRegex.test(formData.CCCDorPASSPORT)) err.CCCDorPASSPORT = 'Số CCCD phải đủ 12 chữ số hoặc Hộ chiếu chứa 9 ký tự';

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.PhoneNumber)) err.PhoneNumber = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0';

    if (!formData.Email || !/^\S+@\S+\.\S+$/.test(formData.Email)) err.Email = 'Email không đúng định dạng (cần chứa @ và .)';
    if (!formData.NgheNghiep.trim()) err.NgheNghiep = 'Vui lòng nhập nghề nghiệp';
    if (!formData.addressOnCCCD.trim()) err.addressOnCCCD = 'Vui lòng nhập địa chỉ thường trú trên CCCD';
    if (!formData.CurrentResidence.trim()) err.CurrentResidence = 'Vui lòng nhập nơi ở hiện tại';

    setErrors(err);

    if (Object.keys(err).length > 0) {
      const firstErrorMsg = Object.values(err)[0];
      showModal(firstErrorMsg, 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/blood/register-donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        const message = result.code === 'DUPLICATE_CCCD'
          ? 'Chứng minh nhân dân/Passport đã được sử dụng'
          : result.code === 'DUPLICATE_DONATION'
            ? 'Thông tin này đang ở trạng thái "hiến máu"'
            : result.message || 'Đăng ký không thành công!';

        showModal(message, 'error');
      } else {
        let successMsg = `Đăng ký hiến máu thành công!\nMã đơn của bạn: ${formData.maDon}`;
        if (result.warningMessage) {
          successMsg += `\n\nCẢNH BÁO: ${result.warningMessage}`;
        }

        showModal(successMsg, 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1400);
      }
    } catch (error) {
      showModal('Không thể kết nối tới máy chủ!', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 font-semibold text-gray-600">Đang tải dữ liệu từ cơ sở dữ liệu...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-[384px] h-[220px] rounded-2xl border bg-white p-6 text-center shadow-2xl flex flex-col justify-between border-red-200">
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${modal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {modal.type === 'success' ? 'V' : '!'}
            </div>
            <p className="whitespace-pre-line text-base font-semibold text-slate-800">{modal.message}</p>
            <button
              type="button"
              onClick={() => {
                closeModal();
                if (modal.type === 'success') {
                  window.location.href = '/';
                }
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6 font-sans">
              {/* Kích thước cố định màn hình */}
        <div className="bg-white w-[768px] h-[1050px] p-8 rounded-xl shadow-sm border border-gray-200 overflow-y-auto flex flex-col justify-between">
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Phiếu Đăng Ký Hiến Máu</h1>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-2 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
            
            {/* Họ và Tên */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <div className="w-full md:w-2/3 grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Họ"
                  value={nameParts.lastName}
                  onChange={handleNameChange}
                  className="p-2 border rounded-md text-sm outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  name="midName"
                  placeholder="Tên đệm"
                  value={nameParts.midName}
                  onChange={handleNameChange}
                  className="p-2 border rounded-md text-sm outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  name="firstName"
                  placeholder="Tên"
                  value={nameParts.firstName}
                  onChange={handleNameChange}
                  className="p-2 border rounded-md text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>
            {errors.HovaTen && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.HovaTen}</p>}

            {/* Nghề nghiệp */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Nghề nghiệp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="NgheNghiep"
                placeholder="Nhập nghề nghiệp hiện tại"
                value={formData.NgheNghiep}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.NgheNghiep && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.NgheNghiep}</p>}

            {/* Email */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Email liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="Email"
                placeholder="Nhập địa chỉ email liên lạc"
                value={formData.Email}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.Email && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.Email}</p>}

            {/* Số điện thoại */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="PhoneNumber"
                placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                value={formData.PhoneNumber}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.PhoneNumber && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.PhoneNumber}</p>}

            {/* Ngày sinh */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="DayofBirth"
                value={formData.DayofBirth}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 text-gray-700"
              />
            </div>
            {errors.DayofBirth && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.DayofBirth}</p>}

            {/* Giới tính */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="GioiTinh"
                value={formData.GioiTinh}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
              </select>
            </div>

            {/* Nhóm máu */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Nhóm máu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="NhomMau"
                maxLength={5}
                placeholder="Nhập nhóm máu (ví dụ: A+, O-, Chưa biết)"
                value={formData.NhomMau}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>

            {/* Số CCCD / Hộ chiếu */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Số CCCD / Hộ chiếu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="CCCDorPASSPORT"
                placeholder="Nhập 12 số CCCD hoặc 9 ký tự Hộ chiếu"
                value={formData.CCCDorPASSPORT}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.CCCDorPASSPORT && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.CCCDorPASSPORT}</p>}

            {/* Địa chỉ thường trú */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Địa chỉ thường trú (CCCD) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="addressOnCCCD"
                rows="2"
                placeholder="Nhập địa chỉ thường trú ghi trên CCCD"
                value={formData.addressOnCCCD}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>
            {errors.addressOnCCCD && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.addressOnCCCD}</p>}

            {/* Nơi ở hiện tại */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Nơi ở hiện tại / Tạm trú <span className="text-red-500">*</span>
              </label>
              <textarea
                name="CurrentResidence"
                rows="2"
                placeholder="Nhập địa chỉ nơi ở / tạm trú hiện tại"
                value={formData.CurrentResidence}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>
            {errors.CurrentResidence && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.CurrentResidence}</p>}

            {/* Ngày hiến máu gần nhất */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Ngày hiến máu gần nhất
              </label>
              <input
                type="date"
                name="NgayHienGanNhat"
                value={formData.NgayHienGanNhat}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 text-gray-700"
              />
            </div>

            {/* Tiền sử bệnh lý */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Tiền sử bệnh lý / Bệnh nền
              </label>
              <textarea
                name="UnderlyingMedicalCondition_Optional"
                rows="2"
                placeholder="Nhập tiền sử bệnh lý nếu có (hoặc ghi Không)"
                value={formData.UnderlyingMedicalCondition_Optional}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>

            {/* Nút gửi */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md shadow transition duration-200"
              >
                Gửi Đăng Ký Hiến Máu
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterDonate;