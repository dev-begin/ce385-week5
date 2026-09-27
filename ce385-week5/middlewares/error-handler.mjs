// middlewares/error-handler.mjs

// AppError พกสถานะ HTTP ติดตัวไปด้วยเสมอ (404 ไม่พบ, 400 ข้อมูลไม่ครบ/ผิด, 409 ซ้ำ)
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// จับเส้นทางที่ไม่มีใครรับ (ต้องแขวนไว้หลัง router ทั้งหมด ก่อน errorHandler)
export function notFound(req, res, next) {
  next(new AppError(404, `ไม่พบเส้นทาง ${req.originalUrl}`));
}

// errorHandler ตัวเดียวจบ — ต้องมีครบ 4 พารามิเตอร์ (err, req, res, next) เสมอ
// ถึงจะถูก Express จำได้ว่าเป็น error-handling middleware (ดูคำตอบข้อ 2 ใน ex4-router-error.mjs)
export function errorHandler(err, req, res, next) {
  const status = err instanceof AppError ? err.status : 500;
  // status >= 500 ห้ามส่งข้อความ error จริงออกไปให้ client เห็น (อาจหลุดรายละเอียดระบบ)
  const message = status >= 500 ? "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" : err.message;
  res.status(status).json({ error: message });
}
