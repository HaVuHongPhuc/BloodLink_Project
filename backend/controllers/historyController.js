const LichSuNhapXuat = require('../models/LichSuNhapXuat');
const BenhVienHopTac = require('../models/BenhVienHopTac');

// Tra cứu lịch sử nhập xuất máu (UC31 - BM22) từ collection LichSuNhapXuat
exports.getBloodHistory = async (req, res) => {
    try {
        // 1. Lấy mã bệnh viện từ thông tin người dùng đang đăng nhập (authMiddleware gán vào req.user)
        const hospitalId = req.user?.maBenhVien || req.user?.MaBenhVien || req.user?.MaTaiKhoanBenhVien;

        // --- THÊM LOG TẠI ĐÂY ---
        console.log(">>> Logged in Hospital ID:", hospitalId);

        if (!hospitalId) {
            return res.status(401).json({ success: false, message: 'Không thể xác định mã bệnh viện.' });
        }

        // 2. Lấy tham số tìm kiếm/lọc từ Frontend gửi lên
        const { keyword, startDate, endDate, statType } = req.query;

        // 3. Tìm thêm các mã bệnh viện liên quan (nếu bệnh viện có profile phụ dùng Email khác)
        const userEmail = req.user?.Email || req.user?.email;
        const hospitalDoc = await BenhVienHopTac.findOne({
            $or: [
                { Email: userEmail },
                { MaBenhVien: hospitalId }
            ]
        }).lean();

        // Gom tất cả IDs có thể có của bệnh viện này thành một mảng
        const idsToSearch = [hospitalId, hospitalDoc?.MaBenhVien, hospitalDoc?.MaTaiKhoanBenhVien].filter(Boolean);

        // --- THÊM LOG TẠI ĐÂY ---
        console.log(">>> Danh sách IDs dùng để tìm kiếm:", idsToSearch);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const parseDate = (value) => {
            if (!value) return null;
            const raw = String(value).trim();

            const dmyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
            if (dmyMatch) {
                const day = Number(dmyMatch[1]);
                const month = Number(dmyMatch[2]);
                const year = Number(dmyMatch[3]);
                const parsedDMY = new Date(year, month - 1, day);
                if (
                    Number.isNaN(parsedDMY.getTime()) ||
                    parsedDMY.getFullYear() !== year ||
                    parsedDMY.getMonth() !== month - 1 ||
                    parsedDMY.getDate() !== day
                ) {
                    return null;
                }
                return parsedDMY;
            }

            const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
            if (isoMatch) {
                const year = Number(isoMatch[1]);
                const month = Number(isoMatch[2]);
                const day = Number(isoMatch[3]);
                const parsedISO = new Date(year, month - 1, day);
                if (
                    Number.isNaN(parsedISO.getTime()) ||
                    parsedISO.getFullYear() !== year ||
                    parsedISO.getMonth() !== month - 1 ||
                    parsedISO.getDate() !== day
                ) {
                    return null;
                }
                return parsedISO;
            }

            return null;
        };

        const start = parseDate(startDate);
        const end = parseDate(endDate);

        if ((startDate && !start) || (endDate && !end)) {
            return res.json({ success: true, data: [], message: 'Không tìm thấy lịch sử phù hợp' });
        }

        const maxRangeDays = 30;
        let finalStart = start ? new Date(start) : null;
        let finalEnd = end ? new Date(end) : null;

        if (finalStart) finalStart.setHours(0, 0, 0, 0);
        if (finalEnd) finalEnd.setHours(23, 59, 59, 999);

        if (finalStart && finalStart > today) {
            return res.json({ success: true, data: [], message: 'Không tìm thấy lịch sử phù hợp' });
        }

        if (finalEnd && finalEnd > today) {
            return res.json({ success: true, data: [], message: 'Không tìm thấy lịch sử phù hợp' });
        }

        if (finalStart && finalEnd && finalStart > finalEnd) {
            return res.json({ success: true, data: [], message: 'Không tìm thấy lịch sử phù hợp' });
        }

        if (!finalStart && !finalEnd) {
            finalEnd = today;
            finalStart = new Date(today);
            finalStart.setDate(finalStart.getDate() - (maxRangeDays - 1));
            finalStart.setHours(0, 0, 0, 0);
        } else if (finalStart && !finalEnd) {
            finalEnd = new Date(finalStart);
            finalEnd.setDate(finalEnd.getDate() + (maxRangeDays - 1));
            if (finalEnd > today) finalEnd = today;
        } else if (!finalStart && finalEnd) {
            finalStart = new Date(finalEnd);
            finalStart.setDate(finalStart.getDate() - (maxRangeDays - 1));
            finalStart.setHours(0, 0, 0, 0);
        } else if (finalStart && finalEnd) {
            const diffMs = finalEnd - finalStart;
            const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1;
            if (diffDays > maxRangeDays) {
                finalStart = new Date(finalEnd);
                finalStart.setDate(finalStart.getDate() - (maxRangeDays - 1));
                finalStart.setHours(0, 0, 0, 0);
            }
        }

        const historyQuery = {
            $or: [
                { MaBenhVien: { $in: idsToSearch } },
                { MaTaiKhoanBenhVien: { $in: idsToSearch } }
            ],
            ThoiGian: { $gte: finalStart, $lte: finalEnd }
        };

        if (statType === 'donated') {
            historyQuery.HinhThuc = 'Nhap';
        }

        if (statType === 'transfused') {
            historyQuery.HinhThuc = 'Xuat';
        }

        if (keyword && keyword.trim() !== '') {
            const regex = new RegExp(keyword.trim(), 'i');
            historyQuery.$and = [
                {
                    $or: [
                        { HoTenKhachHang: regex },
                        { MaDon: regex },
                        { MaMau: regex },
                        { NhomMau: regex },
                        { MaLichSu: regex }
                    ]
                }
            ];
        }

        console.log('>>> Query gửi xuống DB:', JSON.stringify(historyQuery));

        const historyEntries = await LichSuNhapXuat.find(historyQuery)
            .sort({ ThoiGian: -1 })
            .lean();

        console.log('>>> Số lượng lịch sử tìm thấy:', historyEntries.length);

        const formattedHistory = historyEntries.map((entry) => ({
            ...entry,
            HoTenKhachHang: entry.HoTenKhachHang || 'Ẩn danh'
        }));

        const shouldShowNoMatch = historyEntries.length === 0 && (keyword || startDate || endDate);

        let weeklyTotal;
        if (statType === 'donated' || statType === 'transfused') {
            const now = new Date();
            const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - dayIndex);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weeklyQuery = {
                $or: [
                    { MaBenhVien: { $in: idsToSearch } },
                    { MaTaiKhoanBenhVien: { $in: idsToSearch } }
                ],
                HinhThuc: statType === 'donated' ? 'Nhap' : 'Xuat',
                ThoiGian: { $gte: weekStart, $lte: weekEnd }
            };

            weeklyTotal = await LichSuNhapXuat.countDocuments(weeklyQuery);
        }
        const emptyMessage =
            historyEntries.length === 0
                ? statType === 'donated'
                    ? 'MS38 Không tồn tại dữ liệu'
                    : statType === 'transfused'
                        ? 'Không đủ dữ liệu để thống kê'
                        : shouldShowNoMatch
                            ? 'Không tìm thấy lịch sử phù hợp'
                            : undefined
                : undefined;

        return res.json({
            success: true,
            data: formattedHistory,
            message: emptyMessage,
            weeklyTotal
        });

    } catch (error) {
        // Cố gắng log lỗi chi tiết ra console server
        console.error('Lỗi khi lấy lịch sử từ đơn đăng ký:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};