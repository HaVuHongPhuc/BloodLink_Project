import { useState, useEffect } from "react";
import Layout from "../Layout";
import { apiUrl } from "../../utils/apiBaseUrl";

const RegisterDonate = () => {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);

  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isUnder12Weeks, setIsUnder12Weeks] = useState(false);
  const [lastDonationDateStr, setLastDonationDateStr] = useState('');
  
  // State hiển thị chuỗi ngày dd/mm/yyyy riêng cho giao diện UI
  const [displayNgayHienText, setDisplayNgayHienText] = useState('Chưa từng hiến máu');

  const [urgentNewsContext, setUrgentNewsContext] = useState(null);

  const [formData, setFormData] = useState({
    MaDon: '',
    MaBenhVien: '',
    HoTen: '',
    GioiTinh: 'Nam',
    NgaySinh: '',
    SoCCCD: '',
    SoDienThoai: '',
    Email: '',
    DiaChi: '',
    NhomMau: '',
    NgayHienGanNhat: null, 
    BenhNen: 'Không có bệnh nền'
  });

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ open: false, message: '', type: 'error' });

  // 1. Định dạng dd/mm/yyyy hiển thị lên giao diện UI
  const formatDateVN = (dateInput) => {
    if (!dateInput) return 'Chưa từng hiến máu';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Chưa từng hiến máu';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 2. Định dạng YYYY-MM-DD dành riêng cho input type="date"
  const formatDateToLocalInput = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const showModal = (message, type = 'error') => {
    setModal({ open: true, message, type });
  };

  const closeModal = () => {
    setModal({ open: false, message: '', type: 'error' });
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchDataFromDB = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urgentNewsId = searchParams.get('urgentNewsId');
        const urgentNewsHospitalCode = searchParams.get('hospitalCode');
        const urgentNewsHospitalName = searchParams.get('hospitalName');

        // Tải danh sách bệnh viện hợp tác
        const resHospitals = await fetch(apiUrl('/api/blood/hospitals'));
        const dataHospitals = await resHospitals.json();
        
        let defaultMaBenhVien = '';
        if (dataHospitals.success && dataHospitals.data.length > 0) {
          setHospitals(dataHospitals.data);
          defaultMaBenhVien = dataHospitals.data[0].MaBenhVien;

          if (urgentNewsHospitalCode) {
            const matchedHospital = dataHospitals.data.find((hospital) => hospital.MaBenhVien === urgentNewsHospitalCode);
            if (matchedHospital) {
              defaultMaBenhVien = matchedHospital.MaBenhVien;
              setUrgentNewsContext({
                id: urgentNewsId,
                hospitalCode: matchedHospital.MaBenhVien,
                hospitalName: urgentNewsHospitalName || matchedHospital.TenBenhVien
              });
            }
          }
        }

        // Tải thông tin hồ sơ khách hàng
        const response = await fetch(apiUrl('/api/users/profile'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.data) {
          const user = result.data;

          const hoTen = user.HoTen || '';
          const sdt = user.SoDienThoai || '';
          const cccd = user.SoCCCD || '';
          const ngaySinh = user.NgaySinh || '';
          const diaChi = user.DiaChi || '';

          if (!hoTen.trim() || !sdt.trim() || !cccd.trim() || !ngaySinh || !diaChi.trim()) {
            setIsProfileIncomplete(true);
          }

          const ngayHienMauDb = user.NgayHienGanNhat || user.NgayDangKyHienMauGanNhat;
          let rawDateForDB = null;

          if (ngayHienMauDb) {
            const lastDate = new Date(ngayHienMauDb);
            rawDateForDB = lastDate.toISOString(); // Dữ liệu ngày chuẩn gửi DB

            // Cập nhật chuỗi dd/mm/yyyy hiển thị trên UI
            const formattedVN = formatDateVN(lastDate);
            setDisplayNgayHienText(formattedVN);
            setLastDonationDateStr(formattedVN);

            const today = new Date();
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 84) {
              setIsUnder12Weeks(true);
            }
          } else {
            setDisplayNgayHienText('Chưa từng hiến máu');
          }

          setFormData((prev) => ({
            ...prev,
            MaDon: `D${Date.now().toString().slice(-9)}`,
            MaBenhVien: defaultMaBenhVien,
            HoTen: hoTen,
            GioiTinh: user.GioiTinh || 'Nam',
            NgaySinh: ngaySinh ? formatDateToLocalInput(ngaySinh) : '',
            SoCCCD: cccd,
            SoDienThoai: sdt,
            Email: user.Email || user.email || '',
            DiaChi: diaChi,
            NhomMau: user.NhomMau || '',
            NgayHienGanNhat: rawDateForDB, // Gửi chuẩn ISO Date về Backend
            BenhNen: 'Không có bệnh nền'
          }));
        }
      } catch (error) {
        console.error('Không thể tải thông tin từ cơ sở dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromDB();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let err = {};

    if (!formData.MaBenhVien) err.MaBenhVien = 'Vui lòng chọn bệnh viện tiếp nhận';
    if (!formData.HoTen.trim()) err.HoTen = 'Vui lòng nhập đầy đủ họ và tên';
    else if (/\d/.test(formData.HoTen)) err.HoTen = 'Họ tên chỉ chứa ký tự chữ, không chứa chữ số';

    if (!formData.NgaySinh) err.NgaySinh = 'Vui lòng chọn ngày sinh';
    else if (!checkIs18Plus(formData.NgaySinh)) err.NgaySinh = 'Người hiến máu phải từ đủ 18 tuổi trở lên';

    const cccdRegex = /^([0-9]{12}|[A-Za-z0-9]{9,15})$/;
    if (!cccdRegex.test(formData.SoCCCD)) err.SoCCCD = 'Số CCCD phải đủ 12 chữ số hoặc Hộ chiếu từ 9 đến 15 ký tự';

    const phoneRegex = /^0[0-9]{9,14}$/;
    if (!phoneRegex.test(formData.SoDienThoai)) err.SoDienThoai = 'Số điện thoại phải từ 10 đến 15 chữ số và bắt đầu bằng số 0';

    if (!formData.Email || !/^\S+@\S+\.\S+$/.test(formData.Email)) err.Email = 'Email không đúng định dạng';
    if (!formData.DiaChi.trim()) err.DiaChi = 'Vui lòng nhập địa chỉ liên hệ';

    setErrors(err);

    if (Object.keys(err).length > 0) {
      const firstErrorMsg = Object.values(err)[0];
      showModal(firstErrorMsg, 'error');
      return;
    }

    const token = localStorage.getItem('userToken');

    try {
      const payload = {
        ...formData,
        urgentNewsId: urgentNewsContext?.id || null
      };

      const response = await fetch(apiUrl('/api/blood/register-donate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        showModal(result.message || 'Đăng ký không thành công!', 'error');
      } else {
        showModal('Đã đăng ký đơn thành công', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
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
          <div className="w-[384px] p-6 rounded-2xl bg-white text-center shadow-2xl flex flex-col justify-between border border-gray-200">
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${modal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {modal.type === 'success' ? '✓' : '!'}
            </div>
            <p className={`my-4 text-base font-semibold ${modal.type === 'success' ? 'text-green-700' : 'text-slate-800'}`}>
              {modal.message}
            </p>
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
        <div className="bg-white w-[768px] p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Phiếu Đăng Ký Hiến Máu</h1>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-2 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {urgentNewsContext && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Đăng ký cho tin khẩn cấp tại <span className="font-semibold">{urgentNewsContext.hospitalName}</span> (Mã: {urgentNewsContext.hospitalCode})
              </div>
            )}

            {/* Bệnh viện tiếp nhận */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Bệnh viện tiếp nhận <span className="text-red-500">*</span>
              </label>
              <select
                name="MaBenhVien"
                value={formData.MaBenhVien}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 bg-white font-medium text-gray-800"
              >
                {hospitals.map((hosp) => (
                  <option key={hosp._id} value={hosp.MaBenhVien}>
                    {hosp.TenBenhVien}
                  </option>
                ))}
              </select>
            </div>
            {errors.MaBenhVien && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.MaBenhVien}</p>}

            {/* Họ và Tên */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="HoTen"
                maxLength={255}
                placeholder="Nhập đầy đủ họ và tên"
                value={formData.HoTen}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.HoTen && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.HoTen}</p>}

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
                name="SoDienThoai"
                maxLength={15}
                placeholder="Nhập số điện thoại"
                value={formData.SoDienThoai}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.SoDienThoai && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.SoDienThoai}</p>}

            {/* Ngày sinh */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="NgaySinh"
                value={formData.NgaySinh}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 text-gray-700"
              />
            </div>
            {errors.NgaySinh && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.NgaySinh}</p>}

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
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Nhóm máu */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Nhóm máu
              </label>
              <input
                type="text"
                name="NhomMau"
                maxLength={5}
                placeholder="Nhập nhóm máu (VD: O, A+, Chưa biết)"
                value={formData.NhomMau}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 font-semibold uppercase"
              />
            </div>

            {/* Số CCCD / Hộ chiếu */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Số CCCD / Hộ chiếu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="SoCCCD"
                maxLength={15}
                placeholder="Nhập 12 số CCCD hoặc số Hộ chiếu"
                value={formData.SoCCCD}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.SoCCCD && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.SoCCCD}</p>}

            {/* Địa chỉ liên hệ */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Địa chỉ liên hệ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="DiaChi"
                rows="2"
                maxLength={255}
                placeholder="Nhập địa chỉ liên hệ hiện tại"
                value={formData.DiaChi}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>
            {errors.DiaChi && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.DiaChi}</p>}

            {/* Ngày hiến máu gần nhất: Hiển thị chuỗi dd/mm/yyyy từ displayNgayHienText */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Ngày hiến máu gần nhất
              </label>
              <input
                type="text"
                value={displayNgayHienText}
                readOnly
                disabled
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 font-semibold cursor-not-allowed select-none"
              />
            </div>

            {/* Bệnh nền */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Bệnh nền / Tiền sử bệnh
              </label>
              <textarea
                name="BenhNen"
                rows="2"
                maxLength={255}
                placeholder="Nhập thông tin bệnh nền (mặc định: Không có bệnh nền)"
                value={formData.BenhNen}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>

            {/* Nút gửi hoặc Cảnh báo */}
            <div className="pt-4 border-t mt-4 flex justify-end">
              {isProfileIncomplete ? (
                <div className="w-full bg-red-50 border border-red-300 p-3 rounded-md text-center">
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    Vui lòng cập nhật đầy đủ thông tin hồ sơ cá nhân trước khi đăng ký hiến máu.
                  </p>
                  <a
                    href="/profile"
                    className="inline-block px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition"
                  >
                    Đi tới Cập nhật hồ sơ
                  </a>
                </div>
              ) : isUnder12Weeks ? (
                <div className="w-full bg-amber-50 border border-amber-300 p-3 rounded-md text-center">
                  <p className="text-sm font-semibold text-amber-800">
                    Bạn chưa đủ 12 tuần kể từ lần hiến máu gần nhất ({lastDonationDateStr}). Vui lòng quay lại sau!
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md shadow transition duration-200"
                >
                  Gửi Đăng Ký Hiến Máu
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterDonate;