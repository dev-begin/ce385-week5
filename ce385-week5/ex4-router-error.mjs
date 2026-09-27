// ex4-router-error.mjs
// Workshop 4 - ข้อที่ 4: แยก Router และรวมศูนย์ Error
// ผลลัพธ์ที่ยิงจาก Postman ต้องเหมือนข้อ 3 (ex3-crud.mjs) ทุกประการ

import express from "express";
import todoRouter from "./routes/todos.mjs";
import { logger } from "./middlewares/logger.mjs";
import { notFound, errorHandler } from "./middlewares/error-handler.mjs";

const app = express();
const PORT = 3000;

app.use(logger);
app.use(express.json());

// base path "/api/v1/todos" ถูกผูกไว้ที่จุดเดียวตรงนี้เท่านั้น
app.use("/api/v1/todos", todoRouter);

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

// ต้องแขวนหลังสุด: ก่อน errorHandler
app.use(notFound);
// error-handling middleware ต้องมาเป็นตัวสุดท้ายของทั้งไฟล์เสมอ
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
ตอบเป็น comment ท้ายไฟล์

1. ย้ายทั้งกลุ่มไป /api/v2/todos ต้องแก้ไฟล์เพราะอะไร?
   แก้แค่บรรทัดเดียวในไฟล์นี้ ตรง app.use("/api/v1/todos", todoRouter) เปลี่ยนเป็น
   "/api/v2/todos" เพราะ base path ถูกผูกไว้ที่จุดเดียวตอน mount router เท่านั้น ไม่ได้
   กระจายไปฝังอยู่ในแต่ละ route handler เลย routes/todos.mjs ไม่ต้องแก้อะไรเลย เพราะมันไม่รู้
   ด้วยซ้ำว่าตัวเองถูกแขวนอยู่ใต้ path ไหน — นี่คือประโยชน์หลักของการแยก Router ออกมา

2. ทำไม errorHandler ต้องมี 4 พารามิเตอร์ เขียน 3 ตัวจะเกิดอะไรขึ้น?
   Express ใช้ "จำนวนพารามิเตอร์" ของฟังก์ชันเป็นตัวตัดสินว่ามันคือ error-handling
   middleware หรือ middleware ปกติ ถ้าเขียนแค่ (req, res, next) 3 ตัว Express จะเข้าใจว่า
   เป็น middleware ธรรมดา ไม่ใช่ error handler แล้วจะไม่ถูกเรียกเลยเวลามี next(err) เกิดขึ้น
   ทำให้ error หลุดลอยไปโดยไม่มีใครจัดการ (request ค้างหรือ crash) ต้องเขียนครบ 4 ตัว
   (err, req, res, next) เสมอ แม้ในฟังก์ชันจะไม่ได้ใช้ next ก็ตาม

3. service ที่ไม่ import express ได้ประโยชน์อะไรบ้าง (อย่างน้อย 2 ข้อ)?
   (1) ทดสอบง่ายขึ้นมาก — เขียน unit test เรียกฟังก์ชันตรง ๆ ส่งข้อมูลเข้าไป เช็คค่าที่คืนหรือ
   error ที่ throw ได้เลย ไม่ต้องสร้าง req/res ปลอมหรือรัน server จริง
   (2) แยกกฎธุรกิจออกจากชั้น HTTP อย่างสมบูรณ์ — จะเอา service เดียวกันนี้ไปใช้กับ CLI, cron
   job, หรือเปลี่ยนไปใช้ framework อื่นแทน Express ก็ยังเรียกใช้ได้ทันทีโดยไม่ต้องแก้โค้ด
   ชั้นนี้เลยสักบรรทัด

4. handler แบบ async ที่ throw — Express 4 จับให้หรือไม่ แก้อย่างไร?
   ใน Express 4 ไม่จับให้อัตโนมัติ ถ้า async handler throw หรือ Promise reject เฉย ๆ
   Express 4 จะไม่รู้เรื่องด้วย ทำให้ request ค้างไม่ตอบกลับ หรือกลายเป็น unhandled rejection
   เงียบ ๆ ไม่ไปเข้า errorHandler เลย วิธีแก้คือห่อ handler ด้วย try/catch แล้วเรียก next(err)
   เอง หรือใช้ wrapper อย่างฟังก์ชัน wrap() ที่เขียนไว้ใน routes/todos.mjs
   (Promise.resolve(fn(...)).catch(next)) เพื่อดัก error แล้วส่งเข้า errorHandler ให้
   อัตโนมัติทุกเส้นทาง (หมายเหตุ: Express 5 ที่ติดตั้งในโปรเจกต์นี้แก้ปัญหานี้ให้ในตัวแล้ว
   แต่โจทย์นี้เน้นให้เข้าใจพฤติกรรมของ Express 4 และวิธีแก้ด้วยมือ จึงยังคงเขียน wrapper
   ไว้ให้เห็น pattern ที่ถูกต้อง)
*/
