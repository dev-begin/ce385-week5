// ex2-middleware.mjs
// Workshop 4 - ข้อที่ 2: เขียน Middleware เอง

import express from "express";

const app = express();
const PORT = 3000;

const todos = [
  { id: "1", title: "อ่านหนังสือ CE385", done: false, priority: "high" },
  { id: "2", title: "ทำ Workshop 4", done: false, priority: "high" },
  { id: "3", title: "ซักผ้า", done: true, priority: "low" },
  { id: "4", title: "นัดหมอ", done: false, priority: "normal" },
];

// ต้องมาก่อน route ที่อ่าน req.body เสมอ (ดูคำตอบข้อทดลอง ข) ด้านล่าง)
app.use(express.json());

// ส่วนที่ 1 — logger (application-level)
// วัดเวลาจริงด้วย process.hrtime.bigint() แล้วพิมพ์ตอน response จบจริง ๆ (event "finish")
function logger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms.toFixed(0)}ms)`);
  });
  next();
}

// ส่วนที่ 2 — requireApiKey (application-level)
// ยกเว้น GET /health ให้เข้าได้เสมอ ไม่ต้องมี key
function requireApiKey(req, res, next) {
  if (req.method === "GET" && req.path === "/health") {
    return next();
  }
  const key = req.get("x-api-key");
  if (!key) {
    return res.status(401).json({ error: "ต้องส่ง x-api-key" });
  }
  if (key !== "ce385") {
    return res.status(403).json({ error: "x-api-key ไม่ถูกต้อง" });
  }
  return next();
}

app.use(logger);
app.use(requireApiKey);

// ส่วนที่ 3 — validateTodo (route-level) ใช้เฉพาะเส้นทางที่รับ body
function validateTodo(req, res, next) {
  const { title, priority } = req.body;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title ต้องเป็น string และห้ามว่าง" });
  }
  const allowedPriority = ["high", "normal", "low"];
  if (priority !== undefined && !allowedPriority.includes(priority)) {
    return res.status(400).json({ error: "priority ต้องเป็น high, normal หรือ low เท่านั้น" });
  }
  return next();
}

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.get("/todos", (req, res) => {
  return res.json(todos);
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: `ไม่พบรายการ ${req.params.id}` });
  }
  return res.json(todo);
});

// route ทดสอบ validateTodo แบบ route-level (ยังไม่ใช่ CRUD ตัวเต็ม รอทำในข้อ 3)
app.post("/todos", validateTodo, (req, res) => {
  const { title, priority = "normal", done = false } = req.body;
  const newTodo = { id: String(todos.length + 1), title, done: Boolean(done), priority };
  todos.push(newTodo);
  return res.status(201).json(newTodo);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
ส่วนที่ 4 — ทดลอง 3 อย่างแล้วจดผลเป็น comment

ก) ลบ next() ออกจาก logger
   ผล: request ค้างไม่ตอบกลับเลย (timeout) chain หยุดอยู่แค่ logger ตัวเดียว
   res.on("finish", ...) แค่ผูกฟังเหตุการณ์ล่วงหน้า ไม่ได้ทำให้ response ถูกส่งออกไปจริง
   route ถัดไปเลยไม่มีโอกาสได้ตอบกลับเลย

ข) ย้าย express.json() ไปไว้หลัง app.post
   ผล: req.body จะเป็น undefined ตอนถึง route POST เพราะ body ยังไม่ถูกแปลงจาก raw
   stream เป็น object ก่อนหน้านั้น validateTodo อ่าน req.body.title ไม่ได้ (throw หรือ
   ตอบ 400 ผิดเหตุผลไปเลย) ต้องวาง express.json() ไว้ก่อนเสมอ ถ้ามี route ไหนต้องใช้ body

ค) สลับ logger กับ requireApiKey (เอา requireApiKey ขึ้นก่อน)
   ผล: ถ้า key ผิด/ไม่มี requireApiKey จะตอบ 401/403 แล้วตัดสายทันที logger (ซึ่งอยู่หลัง)
   จะไม่ถูกเรียกเลย แปลว่า request ที่ถูกปฏิเสธจะไม่ถูก log เก็บไว้ เสียข้อมูลสำหรับ
   debug/monitoring ไป ปกติจึงอยากให้ logger รันก่อนเสมอไม่ว่าคำขอจะผ่านหรือไม่ผ่าน

ส่วนที่ 5 — ตอบเป็น comment ท้ายไฟล์

1. ทำไมด่านที่ตอบ res แล้วไม่ควรเรียก next() ต่อ?
   เพราะ response ถูกส่งออกไปแล้ว (ปิด stream ไปแล้ว) ถ้ายังเรียก next() ต่อ middleware/route
   ถัดไปจะพยายาม res.send()/res.json() ซ้ำอีกรอบ ทำให้เกิด error
   "Cannot set headers after they are sent to the client"

2. application-level กับ route-level ต่างกันตรงไหน เลือกใช้เมื่อไหร่?
   application-level (app.use(fn)) รันทุก request ทุกเส้นทางที่เข้ามา เหมาะกับงานที่ต้องทำ
   เหมือนกันหมดไม่ว่าจะเป็น route ไหน เช่น logger, auth
   route-level (ใส่เป็น argument ก่อน handler ใน app.get/app.post ตัวใดตัวหนึ่ง) รันเฉพาะ
   route นั้น เหมาะกับ logic ที่เกี่ยวกับ route นั้นโดยเฉพาะ เช่น validate body ของ POST นี้
   เท่านั้น ไม่เกี่ยวกับ route อื่น

3. เชื่อมโยงกับ Chain of Responsibility — ใครคือผู้รับผิดชอบ และหยุดสายเมื่อไหร่?
   แต่ละ middleware คือ "ผู้รับผิดชอบ" หนึ่งคนในสาย แต่ละคนเลือกเองว่าจะจัดการคำขอนี้เอง
   (ตอบ res กลับแล้วไม่เรียก next — จบสาย) หรือส่งต่อให้คนถัดไปจัดการแทน (เรียก next())
   สายจะหยุดทันทีที่มีใครคนหนึ่งตอบ response กลับไปโดยไม่เรียก next() ต่อ
*/
