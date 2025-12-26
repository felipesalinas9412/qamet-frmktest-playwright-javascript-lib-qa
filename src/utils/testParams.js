require('dotenv').config();

function fmt(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function healthParams() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);


  const updatedBy =
    (process.env.P2_UPDATED_BY && process.env.P2_UPDATED_BY.trim()) ||
    process.env.USER ||
    process.env.USERNAME ||
    'qa-user';

  return {
    groupRegistrationId: Number(process.env.P2_GROUP_REG_ID || 1),
    fromDate: process.env.P2_FROM_DATE || fmt(from),
    thruDate: process.env.P2_THRU_DATE || fmt(today),
    updatedBy, 
  };
}

module.exports = { healthParams };
