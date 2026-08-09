import { useState, useEffect, useCallback } from 'react';
import HospitalLayout from './HospitalLayout';

const HospitalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [statMode, setStatMode] = useState('all');
  const [weeklyTotal, setWeeklyTotal] = useState(null);

  // State bộ lọc tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const parseDMY = (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  };

  const fetchHistory = useCallback((searchKeyword = '', sDate = '', eDate = '', mode = statMode) => {
    const token = localStorage.getItem('partnerToken') || localStorage.getItem('userToken');
    if (!token) {
      window.location.href = '/partner-login';
      return;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const parsedStart = sDate ? parseDMY(sDate) : null;
    const parsedEnd = eDate ? parseDMY(eDate) : null;

    if ((sDate && !parsedStart) || (eDate && !parsedEnd)) {
      setHistory([]);
      setLoading(false);
      setMessage('Vui lòng nhập ngày theo định dạng dd/mm/yyyy');
      return;
    }

    if ((parsedStart && parsedStart > today) || (parsedEnd && parsedEnd > today) || (parsedStart && parsedEnd && parsedStart > parsedEnd)) {
      setHistory([]);
      setLoading(false);
      setMessage('Không tìm thấy lịch sử phù hợp');
      return;
    }

    setLoading(true);
    setMessage('');

    let url = `http://localhost:5000/api/history?`;
    const params = new URLSearchParams();
    if (searchKeyword) params.append('keyword', searchKeyword);
    if (sDate) params.append('startDate', sDate);
    if (eDate) params.append('endDate', eDate);
    if (mode && mode !== 'all') params.append('statType', mode);

    fetch(url + params.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const data = result.data || [];
          setHistory(data);
          setWeeklyTotal(typeof result.weeklyTotal === 'number' ? result.weeklyTotal : null);

          if (data.length === 0) {
            if (mode === 'donated') {
              setMessage('MS38 Không tồn tại dữ liệu');
            } else if (mode === 'transfused') {
              setMessage('Không đủ dữ liệu để thống kê');
            } else if (searchKeyword || sDate || eDate || result.message) {
              setMessage(result.message || 'Không tìm thấy lịch sử phù hợp');
            } else {
              setMessage('');
            }
          } else {
            setMessage(result.message || '');
          }
        } else {
          setHistory([]);
          setWeeklyTotal(null);
          setMessage(result.message || 'Không tìm thấy lịch sử phù hợp');
        }
      })
      .catch(() => {
        setHistory([]);
        setWeeklyTotal(null);
        setMessage('Lỗi kết nối máy chủ');
      })
      .finally(() => setLoading(false));
  }, [statMode]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory(keyword, startDate, endDate, statMode);
  };

  const handleModeChange = (mode) => {
    setStatMode(mode);
    fetchHistory(keyword, startDate, endDate, mode);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN');
  };

  return (
    <HospitalLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
        {/* Tiêu đề chuẩn BM22 */}
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-800">
            Danh sách lịch sử nhập xuất máu
          </h1>
          <p className="text-sm text-gray-500 mt-2">Mặc định hiển thị tối đa dữ liệu trong 30 ngày gần nhất.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('all')}
            className={`px-4 py-2 rounded text-sm font-semibold border transition ${
              statMode === 'all'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Tất cả lịch sử
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('donated')}
            className={`px-4 py-2 rounded text-sm font-semibold border transition ${
              statMode === 'donated'
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
            }`}
          >
            Thống kê máu hiến
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('transfused')}
            className={`px-4 py-2 rounded text-sm font-semibold border transition ${
              statMode === 'transfused'
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
            }`}
          >
            Thống kê máu đã truyền
          </button>
        </div>

        {statMode === 'donated' && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            Tổng số đơn hiến trong tuần này là: {weeklyTotal ?? 0}
          </div>
        )}

        {statMode === 'transfused' && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            Tổng số đơn đã truyền trong tuần này là: {weeklyTotal ?? 0}
          </div>
        )}

        {/* Khối bộ lọc tìm kiếm */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Họ tên khách hàng / Mã đơn / Mã máu
            </label>
            <input
              type="text"
              placeholder="Nhập thông tin tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Từ ngày</label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-red-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Đến ngày</label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-red-500 text-gray-700"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded shadow transition"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Bảng hiển thị danh sách lịch sử BM22 */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-semibold">Đang tải lịch sử nhập xuất...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-600 font-semibold">
            {message || 'Không tồn tại lịch sử nhập xuất'}
          </div>
        ) : (
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse border border-gray-300 text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 whitespace-nowrap">
                  <th className="border border-gray-300 p-3 text-center w-14">STT</th>
                  <th className="border border-gray-300 p-3 text-center">Mã Lịch sử</th>
                  <th className="border border-gray-300 p-3 text-center">Mã đơn</th>
                  <th className="border border-gray-300 p-3 text-center">Tên khách hàng</th>
                  <th className="border border-gray-300 p-3 text-center">Mã máu</th>
                  <th className="border border-gray-300 p-3 text-center">Nhóm máu</th>
                  <th className="border border-gray-300 p-3 text-center">Số Lượng</th>
                  <th className="border border-gray-300 p-3 text-center">Hình thức</th>
                  <th className="border border-gray-300 p-3 text-center">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="border border-gray-300 p-3 text-center font-medium">{index + 1}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold text-gray-700">
                      {item.MaLichSu}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-slate-700 font-medium">
                      {item.MaDon || '—'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-slate-700 font-medium">
                      {item.HoTenKhachHang || '—'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{item.MaMau || '—'}</td>
                    <td className="border border-gray-300 p-3 text-center font-bold uppercase">{item.NhomMau}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">{item.SoLuong}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          item.HinhThuc === 'Nhap'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {item.HinhThuc === 'Nhap' ? 'Nhập máu' : 'Xuất máu'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-center whitespace-nowrap">
                      {formatDate(item.ThoiGian)}
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

export default HospitalHistory;