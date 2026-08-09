const applyUrgentNewsDonationRegistration = (news, quantityReceived = 1) => {
  const currentReceived = Number(news?.SoLuongDaNhan || 0);
  const target = Number(news?.SoLuong || 0);
  const increment = Number(quantityReceived || 0);

  const nextReceived = currentReceived + increment;
  const nextStatus = nextReceived >= target && target > 0 ? 'Đã ẩn' : (news?.TrangThai || 'Đang hiển thị');

  return {
    ...news,
    SoLuongDaNhan: nextReceived,
    TrangThai: nextStatus
  };
};

module.exports = {
  applyUrgentNewsDonationRegistration
};
