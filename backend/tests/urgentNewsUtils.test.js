const test = require('node:test');
const assert = require('node:assert/strict');
const { applyUrgentNewsDonationRegistration } = require('../utils/urgentNewsUtils');

test('increments received quantity and stays active until full', () => {
  const result = applyUrgentNewsDonationRegistration({
    SoLuong: 5,
    SoLuongDaNhan: 2,
    TrangThai: 'Đang hiển thị'
  }, 1);

  assert.equal(result.SoLuongDaNhan, 3);
  assert.equal(result.TrangThai, 'Đang hiển thị');
});

test('hides urgent news once received quantity reaches target', () => {
  const result = applyUrgentNewsDonationRegistration({
    SoLuong: 3,
    SoLuongDaNhan: 2,
    TrangThai: 'Đang hiển thị'
  }, 2);

  assert.equal(result.SoLuongDaNhan, 4);
  assert.equal(result.TrangThai, 'Đã ẩn');
});
