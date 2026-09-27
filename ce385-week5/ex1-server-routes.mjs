// ex1-server-routes.mjs
// Workshop 4 - ข้อที่ 1: ตั้งโปรเจกต์และ Route ชุดแรก

import express from "express";

const app = express();
const PORT = 3000;

// ส่วนที่ 2: ข้อมูลตั้งต้นอย่างน้อย 4 รายการ
// แต่ละรายการมี id (string), title (string), done (boolean), priority ("high"/"normal"/"low")
const todos = [
  { id: "1", title: "อ่านหนังสือ CE385", done: false, priority: "high" },
  { id: "2", title: "ทำ Workshop 4", done: false, priority: "high" },
  { id: "3", title: "ซักผ้า", done: true, priority: "low" },
  { id: "4", title: "นัดหมอ", done: false, priority: "normal" },
];

// ส่วนที่ 3: 3 เส้นทาง

// GET /health -> 200 { status: "ok" }
app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

// GET /todos -> 200 รายการทั้งหมด (คืนสำเนา)
app.get("/todos", (req, res) => {
  return res.json(todos);
});

// GET /todos/:id -> 200 เมื่อพบ, 404 { error: "ไม่พบรายการ <id>" } เมื่อไม่พบ
app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: `ไม่พบรายการ ${req.params.id}` });
  }
  return res.json(todo);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
ส่วนที่ 4 — ตอบเป็น comment ท้ายไฟล์

1. "type": "module" มีผลอะไร ถ้าไม่ใส่แล้วใช้ import จะเกิดอะไรขึ้น?
   "type": "module" ใน package.json สั่ง Node ว่า ให้อ่านไฟล์ .js ในโปรเจกต์นี้แบบ ES Module
   (import/export) แทนที่จะอ่านแบบ CommonJS (require/module.exports) ซึ่งเป็นค่า default เดิม
   ถ้าไม่ใส่ "type": "module" แล้วไปเขียน import express from "express" ในไฟล์ .js ธรรมดา
   Node จะโยน SyntaxError: Cannot use import statement outside a module ทันทีตอนรัน
   (หมายเหตุ: ไฟล์นามสกุล .mjs อย่างไฟล์นี้ Node จะตีความเป็น ES Module เสมอไม่ว่า
   "type" ใน package.json จะตั้งเป็นอะไร นี่คือเหตุผลที่ Workshop นี้ให้ใช้ .mjs)

2. ทำไมกรณีไม่พบต้องตอบ 404 ไม่ใช่ 200 พร้อม body ว่าง — ใครเดือดร้อน?
   status code คือ "สัญญา" ที่ฝั่ง client (โดยเฉพาะโค้ด เช่น front-end หรือ service อื่น)
   ใช้ตัดสินใจก่อนจะไปแตะ body เลยด้วยซ้ำ ถ้าตอบ 200 ทั้งที่หาไม่เจอ โค้ดฝั่งเรียกจะเข้าใจว่า
   "สำเร็จ" แล้วพยายามอ่านค่าจาก body ที่ว่างเปล่า ทำให้เกิด error แทรกซ้อนไปอีกชั้น (เช่น
   undefined.title) ซึ่งดีบักยากกว่าการเช็ค if (status === 404) ตรง ๆ คนที่เดือดร้อนคือ
   ฝั่งที่เรียกใช้ API ต่อ (front-end / mobile / service อื่น) และเครื่องมือ monitoring ที่ใช้
   status code นับสถิติ error ก็จะนับผิดไปด้วย

3. nodemon ต่างจาก node อย่างไร และทำไมติดตั้งเป็น devDependencies?
   node รันไฟล์ครั้งเดียวแล้วหยุด ถ้าแก้โค้ดต้อง Ctrl+C แล้วรันใหม่เองทุกครั้ง
   nodemon ทำหน้าที่เดียวกันแต่ "เฝ้าดู" ไฟล์ในโปรเจกต์ พอเซฟไฟล์ปุ๊บมัน restart server
   ให้อัตโนมัติ ช่วยเร่งรอบการพัฒนา (dev loop) ให้เร็วขึ้น
   มันถูกติดตั้งเป็น devDependencies เพราะจำเป็นแค่ตอน "พัฒนา" เท่านั้น ตอน deploy ขึ้น
   production จริงเราจะรันด้วย node (หรือผ่าน process manager อย่าง pm2/Docker) ไม่ต้องมี
   nodemon ติดไปด้วย การแยกเป็น devDependencies ทำให้ตอน npm install --production หรือ
   npm ci --omit=dev ไม่ต้องโหลดของที่ไม่จำเป็นเข้า production ให้หนักเปล่า ๆ
*/
