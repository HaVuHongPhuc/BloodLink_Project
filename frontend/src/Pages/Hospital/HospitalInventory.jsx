import { useState, useEffect } from 'react';
import HospitalLayout from './HospitalLayout';

const HospitalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Lấy ưu tiên partnerToken trước, nếu không có mới lấy userToken
  const token = localStorage.getItem('partnerToken') || localStorage.getItem('userToken');
  if (!token) {
    window.location.href = '/partner-login';
    return;
  }

  fetch('http://localhost:5000/api/inventory/my-inventory', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        setInventory(result.data || []);
      } else {
        setInventory([]);
      }
    })
    .catch((err) => console.error('Lỗi tải kho máu:', err))
    .finally(() => setLoading(false));
}, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <HospitalLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">1.3.21 BM21: Danh sách máu trong kho</h1>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 font-semibold">Đang tải dữ liệu kho máu...</div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed text-gray-500">
            Hiện chưa có đơn vị máu nào trong kho của bệnh viện.
          </div>
        ) : (
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse border border-gray-300 text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 whitespace-nowrap">
                  <th className="border border-gray-300 p-3 text-center w-14">STT</th>
                  <th className="border border-gray-300 p-3 text-center">Mã máu</th>
                  <th className="border border-gray-300 p-3 text-center">Nhóm máu</th>
                  <th className="border border-gray-300 p-3 text-center">Số lượng</th>
                  <th className="border border-gray-300 p-3 text-center">Hạn sử dụng gần nhất</th>
                  <th className="border border-gray-300 p-3 text-center">Lần nhập gần nhất</th>
                  <th className="border border-gray-300 p-3 text-center">Lần xuất gần nhất</th>
                  <th className="border border-gray-300 p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="border border-gray-300 p-3 text-center font-medium">{index + 1}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold text-red-600">{item.MaMau}</td>
                    <td className="border border-gray-300 p-3 text-center font-bold uppercase">{item.NhomMau}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">{item.SoLuong}</td>
                    <td className="border border-gray-300 p-3 text-center">{formatDate(item.HanSuDung)}</td>
                    <td className="border border-gray-300 p-3 text-center">{formatDate(item.NgayNhap)}</td>
                    <td className="border border-gray-300 p-3 text-center">{formatDate(item.NgayXuat)}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          item.TrangThai === 'Trong kho'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        {item.TrangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HospitalLayout>
  );
};

export default HospitalInventory;