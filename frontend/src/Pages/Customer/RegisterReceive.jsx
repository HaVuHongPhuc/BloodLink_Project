import { useState, useEffect } from "react";
import Layout from "../Layout";

const RegisterReceive = () => {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]); // danh sách bệnh viện hợp tác lấy từ database

  // cờ kiểm tra hồ sơ cá nhân đã đủ thông tin chưa
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  // state lưu dữ liệu form khớp chính xác với mẫu BM16 và bảng DonDangKy
  const [formData, setFormData] = useState({
    MaDon: '',
    MaBenhVien: '',
    NoiNhanMau: '',
    HoTen: '',
    GioiTinh: 'Nam',
    NgaySinh: '',
    SoCCCD: '',
    SoDienThoai: '',
    Email: '',
    DiaChi: '',
    NhomMauCan: '', // nhóm máu chỉ định cần nhận
    SoLuong: '',   // số lượng đơn vị máu
    MucDich: '',   // mục đích nhận máu
    BenhNen: 'Không có bệnh nền'
  });

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ open: false, message: '', type: 'error' });

  const showModal = (message, type = 'error') => {
    setModal({ open: true, message, type });
  };

  const closeModal = () => {
    setModal({ open: false, message: '', type: 'error' });
  };

  // tải danh sách bệnh viện hợp tác và hồ sơ cá nhân từ database khi tải trang
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchDataFromDB = async () => {
      try {
        // tải danh sách bệnh viện hợp tác
        const resHospitals = await fetch('http://localhost:5000/api/blood/hospitals');
        const dataHospitals = await resHospitals.json();
        
        let defaultMaBenhVien = '';
        let defaultTenBenhVien = '';

        if (dataHospitals.success && dataHospitals.data.length > 0) {
          setHospitals(dataHospitals.data);
          defaultMaBenhVien = dataHospitals.data[0].MaBenhVien;
          defaultTenBenhVien = dataHospitals.data[0].TenBenhVien;
        }

        // tải hồ sơ cá nhân
        const response = await fetch('http://localhost:5000/api/users/profile', {
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

          // kiểm tra nếu thiếu thông tin hồ sơ cá nhân cần thiết
          if (!hoTen.trim() || !sdt.trim() || !cccd.trim() || !ngaySinh || !diaChi.trim()) {
            setIsProfileIncomplete(true);
          }

          // tự động điền dữ liệu hồ sơ cá nhân vào form nhận máu
          setFormData((prev) => ({
            ...prev,
            MaDon: `R${Date.now().toString().slice(-9)}`,
            MaBenhVien: defaultMaBenhVien,
            NoiNhanMau: defaultTenBenhVien,
            HoTen: hoTen,
            GioiTinh: user.GioiTinh || 'Nam',
            NgaySinh: ngaySinh ? new Date(ngaySinh).toISOString().split('T')[0] : '',
            SoCCCD: cccd,
            SoDienThoai: sdt,
            Email: user.Email || user.email || '',
            DiaChi: diaChi,
            NhomMauCan: '',
            SoLuong: '1',
            MucDich: '',
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
    
    // nếu thay đổi bệnh viện, tự động cập nhật cả MaBenhVien và TenBenhVien
    if (name === 'MaBenhVien') {
      const selectedHosp = hospitals.find((h) => h.MaBenhVien === value);
      setFormData((prev) => ({
        ...prev,
        MaBenhVien: value,
        NoiNhanMau: selectedHosp ? selectedHosp.TenBenhVien : ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // gửi đơn đăng ký nhận máu về backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    let err = {};

    // ràng buộc lỗi chính xác theo yêu cầu danh mục lỗi UC24
    if (!formData.NhomMauCan || !formData.NhomMauCan.trim()) {
      err.NhomMauCan = 'Vui lòng chọn nhóm máu cần';
    }

    if (!formData.SoLuong || Number(formData.SoLuong) <= 0) {
      err.SoLuong = 'Vui lòng nhập số lượng máu cần';
    }

    if (!formData.MucDich.trim()) {
      err.MucDich = 'Vui lòng điền mục đích nhận máu';
    }

    if (!formData.MaBenhVien) {
      err.MaBenhVien = 'Vui lòng chọn nơi nhận máu';
    }

    setErrors(err);

    if (Object.keys(err).length > 0) {
      const firstErrorMsg = Object.values(err)[0];
      showModal(firstErrorMsg, 'error');
      return;
    }

    const token = localStorage.getItem('userToken');

    try {
      const response = await fetch('http://localhost:5000/api/blood/register-receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        showModal(result.message || 'Đăng ký nhận máu không thành công!', 'error');
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
            <h1 className="text-3xl font-bold text-slate-800">Phiếu Đăng Ký Nhận Máu</h1>
            <div className="w-20 h-1 bg-red-500 mx-auto mt-2 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Nhóm máu cần: cho phép chọn hoặc tự gõ tối đa 5 ký tự */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-bold text-gray-800 mb-1 md:mb-0">
                Nhóm máu cần <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="neededBloodTypeSuggestions"
                name="NhomMauCan"
                maxLength={5}
                placeholder="Chọn hoặc gõ nhóm máu cần (VD: O+, A-, AB+)"
                value={formData.NhomMauCan}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 font-semibold text-gray-800"
              />
              <datalist id="neededBloodTypeSuggestions">
                <option value="A+" />
                <option value="A-" />
                <option value="B+" />
                <option value="B-" />
                <option value="O+" />
                <option value="O-" />
                <option value="AB+" />
                <option value="AB-" />
              </datalist>
            </div>
            {errors.NhomMauCan && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.NhomMauCan}</p>}

            {/* 2. Số lượng cần */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Số lượng (Đơn vị máu) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="SoLuong"
                min="1"
                max="10"
                placeholder="Nhập số lượng đơn vị máu"
                value={formData.SoLuong}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              />
            </div>
            {errors.SoLuong && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.SoLuong}</p>}

            {/* 3. Mục đích nhận máu */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Mục đích <span className="text-red-500">*</span>
              </label>
              <textarea
                name="MucDich"
                rows="2"
                maxLength={255}
                placeholder="Nhập mục đích sử dụng (VD: Cấp cứu tai nạn, Phẫu thuật,...)"
                value={formData.MucDich}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>
            {errors.MucDich && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.MucDich}</p>}

            {/* 4. Họ tên bệnh nhân / người đăng ký */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Họ tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="HoTen"
                value={formData.HoTen}
                disabled
                readOnly
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 font-semibold cursor-not-allowed select-none"
              />
            </div>

            {/* 5. Giới tính */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.GioiTinh}
                disabled
                readOnly
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed select-none"
              />
            </div>

            {/* 6. Ngày sinh */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.NgaySinh}
                disabled
                readOnly
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed select-none"
              />
            </div>

            {/* 7. Điện thoại */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.SoDienThoai}
                disabled
                readOnly
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed select-none"
              />
            </div>

            {/* 8. Địa chỉ */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.DiaChi}
                disabled
                readOnly
                rows="2"
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed select-none"
              ></textarea>
            </div>

            {/* 9. Số CCCD */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Số CCCD / Hộ chiếu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.SoCCCD}
                disabled
                readOnly
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed select-none"
              />
            </div>

            {/* 10. Email */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.Email}
                disabled
                readOnly
                className="w-full md:w-2/3 p-2 border rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed select-none"
              />
            </div>

            {/* 11. Nơi nhận máu (Chọn Bệnh viện hợp tác tiếp nhận) */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0">
                Nơi nhận máu <span className="text-red-500">*</span>
              </label>
              <select
                name="MaBenhVien"
                value={formData.MaBenhVien}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500 bg-white font-medium text-gray-800"
              >
                <option value="">-- Chọn bệnh viện tiếp nhận --</option>
                {hospitals.map((hosp) => (
                  <option key={hosp._id} value={hosp.MaBenhVien}>
                    {hosp.TenBenhVien}
                  </option>
                ))}
              </select>
            </div>
            {errors.MaBenhVien && <p className="text-xs text-red-500 md:ml-[33.33%]">{errors.MaBenhVien}</p>}

            {/* 12. Các bệnh nền nếu có */}
            <div className="flex flex-col md:flex-row md:items-start">
              <label className="w-full md:w-1/3 text-sm font-semibold text-gray-800 mb-1 md:mb-0 pt-2">
                Các bệnh nền nếu có
              </label>
              <textarea
                name="BenhNen"
                rows="2"
                maxLength={255}
                placeholder="Nhập thông tin bệnh nền nếu có (hoặc ghi Không)"
                value={formData.BenhNen}
                onChange={handleChange}
                className="w-full md:w-2/3 p-2 border rounded-md text-sm outline-none focus:border-red-500"
              ></textarea>
            </div>

            {/* Nút đăng ký hoặc Thông báo yêu cầu cập nhật hồ sơ */}
            <div className="pt-4 border-t mt-4 flex justify-end">
              {isProfileIncomplete ? (
                <div className="w-full bg-red-50 border border-red-300 p-3 rounded-md text-center">
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    Vui lòng cập nhật thông tin hồ sơ cá nhân trước khi đăng ký nhận máu.
                  </p>
                  <a
                    href="/profile"
                    className="inline-block px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition"
                  >
                    Đi tới Cập nhật hồ sơ
                  </a>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md shadow transition duration-200"
                >
                  Gửi Đăng Ký Nhận Máu
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterReceive;