import { useState, useEffect } from 'react';
import HospitalLayout from './HospitalLayout';

const HospitalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Modal xác nhận thao tác
  const [confirmModal, setCancelModal] = useState({ open: false, type: '', orderId: null, title: '' });

  const fetchHospitalOrders = () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('partnerToken');
    if (!token) {
      window.location.href = '/partner-login';
      return;
    }

    setLoading(true);
    fetch('http://localhost:5000/api/hospital/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setOrders(result.data || []);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách đơn:', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitalOrders();
  }, []);

  const openActionModal = (type, orderId, title) => {
    setCancelModal({ open: true, type, orderId, title });
  };

  const closeActionModal = () => {
    setCancelModal({ open: false, type: '', orderId: null, title: '' });
  };

  const handleExecuteAction = async () => {
    const { type, orderId } = confirmModal;
    closeActionModal();

    const token = localStorage.getItem('userToken') || localStorage.getItem('partnerToken');
    const endpoint =
      type === 'approve'
        ? `http://localhost:5000/api/hospital/orders/${orderId}/approve`
        : `http://localhost:5000/api/hospital/orders/${orderId}/reject`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(result.message);
        fetchHospitalOrders();
        setTimeout(() => setMessage(''), 3500);
      } else {
        alert(result.message || 'Thao tác không thành công');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const formatTrangThai = (status) => {
    switch (status) {
      case 'Cho_Duyet':
      case 'Cho_Xu_Ly':
        return 'Chờ duyệt';
      case 'Hoan_Thanh':
        return 'Hoàn thành';
      case 'Tu_Choi':
        return 'Từ chối';
      case 'Da_Huy':
        return 'Đã hủy';
      default:
        return status || 'Chờ duyệt';
    }
  };

  return (
    <HospitalLayout>
      {/* Modal xác nhận duyệt hoặc từ chối */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 font-sans">
          <div className="w-[384px] p-6 rounded-2xl bg-white text-center shadow-2xl flex flex-col justify-between border border-gray-200">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full font-bold text-xl ${
                confirmModal.type === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {confirmModal.type === 'approve' ? '✓' : '!'}
            </div>
            <p className="my-4 text-base font-semibold text-slate-800">{confirmModal.title}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={closeActionModal}
                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition ${
                  confirmModal.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">1.3.17 Danh sách đơn đăng ký của khách hàng</h1>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 font-semibold">{message}</div>}

        {loading ? (
          <p className="text-gray-500 text-sm py-4">Đang tải danh sách đơn...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 font-medium">
            Không có đơn đăng ký
          </div>
        ) : (
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse border border-gray-300 text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 whitespace-nowrap">
                  <th className="border border-gray-300 p-2.5 text-center w-12">STT</th>
                  <th className="border border-gray-300 p-2.5 text-center">Mã tài khoản</th>
                  <th className="border border-gray-300 p-2.5 text-center">Mã đơn</th>
                  <th className="border border-gray-300 p-2.5 text-center">Loại đơn</th>
                  <th className="border border-gray-300 p-2.5">Họ tên người gửi</th>
                  <th className="border border-gray-300 p-2.5 text-center">Điện thoại</th>
                  <th className="border border-gray-300 p-2.5">Email</th>
                  <th className="border border-gray-300 p-2.5 text-center">Nhóm máu</th>
                  <th className="border border-gray-300 p-2.5 text-center">Trạng thái</th>
                  <th className="border border-gray-300 p-2.5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const isPending = order.TrangThai === 'Cho_Duyet' || order.TrangThai === 'Cho_Xu_Ly';

                  return (
                    <tr key={order._id || index} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="border border-gray-300 p-2.5 text-center font-medium whitespace-nowrap">{index + 1}</td>
                      <td className="border border-gray-300 p-2.5 text-center font-medium whitespace-nowrap">{order.MaTaiKhoan}</td>
                      <td className="border border-gray-300 p-2.5 text-center font-semibold text-red-600 whitespace-nowrap">{order.MaDon}</td>
                      <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                            order.LoaiDon === 'Hien' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.LoaiDon === 'Hien' ? 'Hiến máu' : 'Nhận máu'}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2.5 font-medium whitespace-nowrap">{order.HoTen}</td>
                      <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">{order.SoDienThoai}</td>
                      <td className="border border-gray-300 p-2.5 whitespace-nowrap">{order.Email}</td>
                      <td className="border border-gray-300 p-2.5 text-center font-bold uppercase whitespace-nowrap">
                        {order.NhomMau || order.NhomMauCan || '—'}
                      </td>
                      <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            order.TrangThai === 'Hoan_Thanh'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : order.TrangThai === 'Tu_Choi' || order.TrangThai === 'Da_Huy'
                              ? 'bg-gray-100 text-gray-700 border border-gray-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {formatTrangThai(order.TrangThai)}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-2.5 text-center whitespace-nowrap">
                        {isPending ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                openActionModal('approve', order._id, 'Xác nhận duyệt đơn đăng ký này?')
                              }
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition shadow-sm"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() =>
                                openActionModal('reject', order._id, 'Bạn có chắc muốn từ chối đơn đăng ký này?')
                              }
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition shadow-sm"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HospitalLayout>
  );
};

export default HospitalOrders;