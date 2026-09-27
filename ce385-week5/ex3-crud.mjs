// ex3-crud.mjs
// Workshop 4 - ข้อที่ 3: CRUD ครบวงจร

import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

let nextId = 5; // id ออกโดยเซิร์ฟเวอร์เท่านั้น ห้ามรับจาก client
const todos = [
  { id: "1", title: "อ่านหนังสือ CE385", done: false, priority: "high" },
  { id: "2", title: "ทำ Workshop 4", done: false, priority: "high" },
  { id: "3", title: "ซักผ้า", done: true, priority: "low" },
  { id: "4", title: "นัดหมอ", done: false, priority: "normal" },
];

const validateTodo = (req, res, next) => {
  const { title, priority } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title ต้องเป็น string และห้ามว่าง" });
  }
  const allowedPriority = ["high", "normal", "low"];
  if (priority !== undefined && !allowedPriority.includes(priority)) {
    return res.status(400).json({ error: "priority ต้องเป็น high, normal หรือ low เท่านั้น" });
  }
  return next();
};

// ส่วนที่ 2 — GET /todos รองรับ ?done, ?q, ?sort ใช้พร้อมกันได้
app.get("/todos", (req, res) => {
  let result = [...todos];

  if (req.query.done !== undefined) {
    const wantDone = req.query.done === "true"; // query param เป็น string เสมอ ดูคำตอบข้อ 1
    result = result.filter((t) => t.done === wantDone);
  }

  if (req.query.q) {
    const keyword = String(req.query.q).toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(keyword));
  }

  if (req.query.sort === "title") {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, "th"));
  }

  return res.json({ total: result.length, items: result });
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: `ไม่พบรายการ ${req.params.id}` });
  }
  return res.json(todo);
});

app.post("/todos", validateTodo, (req, res) => {
  const newTodo = {
    id: String(nextId++), // ส่วนที่ 3: server เป็นคนออก id เอง
    title: req.body.title,
    done: Boolean(req.body.done ?? false),
    priority: req.body.priority ?? "normal",
  };
  todos.push(newTodo);
  return res.status(201).json(newTodo);
});

app.put("/todos/:id", validateTodo, (req, res) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: `ไม่พบรายการ ${req.params.id}` });
  }
  todo.title = req.body.title;
  todo.done = Boolean(req.body.done ?? todo.done);
  todo.priority = req.body.priority ?? todo.priority;
  return res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const index = todos.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: `ไม่พบรายการ ${req.params.id}` });
  }
  todos.splice(index, 1);
  return res.status(204).end(); // 204 ห้ามมี body, ใช้ .end() ไม่ใช่ .json()
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
ส่วนที่ 4 — ตอบเป็น comment ท้ายไฟล์

1. ?done=false ทำไมเช็คด้วย if (done) ตรง ๆ ไม่ได้ ค่าที่ได้จริงเป็นชนิดอะไร?
   query string ทุกตัวถูกส่งมาเป็น "string" เสมอ ไม่ว่าผู้ใช้พิมพ์อะไรก็ตาม ดังนั้น
   req.query.done ที่ได้จริงคือ string "false" ไม่ใช่ boolean false และ string "false"
   เป็นค่า truthy (เพราะไม่ใช่ empty string) ถ้าเช็ค if (done) เฉย ๆ จะเข้าเงื่อนไขเสมอไม่ว่า
   ค่าจะเป็น "true" หรือ "false" ต้องเทียบตรง ๆ ด้วย === "true" เพื่อแปลงเป็น boolean จริงก่อน

2. DELETE ที่สำเร็จควรตอบ 204 หรือ 200 พร้อมข้อมูลที่ลบ — เลือกแล้วให้เหตุผล
   เลือก 204 No Content เพราะทรัพยากรถูกลบไปแล้ว ไม่มีอะไรให้ตอบกลับที่มีประโยชน์อีก
   (ข้อมูลที่ลบไปแล้วเอาไปใช้ต่อไม่ได้) 204 คือ status มาตรฐานที่สื่อว่า "สำเร็จแต่ไม่มี body"
   ตรงความหมายที่สุด จึงเลือกแบบนี้ตาม hint ของโจทย์

3. PUT กับ PATCH ต่างกันอย่างไร ข้อนี้ใช้ PUT เหมาะสมหรือไม่?
   PUT ตามความหมายมาตรฐานคือ "แทนที่ทั้งก้อน" ต้องส่งค่าทุก field มาใหม่ครบ ถ้าขาด field
   ไหนควรถือว่าค่านั้นถูกล้าง ส่วน PATCH คือ "แก้บางส่วน" ส่งเฉพาะ field ที่จะเปลี่ยน field อื่น
   คงเดิม โค้ดที่เขียนในไฟล์นี้ใช้ req.body.xxx ?? todo.xxx (ถ้าไม่ส่งมาให้คงค่าเดิม) ซึ่ง
   พฤติกรรมนี้ตรงกับความหมายของ PATCH มากกว่า PUT ถ้าจะให้ตรง spec จริง ๆ ควรเปลี่ยนไปใช้
   PATCH หรือถ้าจะคง PUT ไว้ ต้องบังคับให้ client ส่งค่าทุก field มาครบเสมอ

4. ยิง DELETE ซ้ำสองครั้งได้ status ต่างกัน (204 แล้ว 404) แบบนี้ยังเรียกว่า idempotent ได้ไหม?
   ได้ — idempotent พูดถึงผลลัพธ์ต่อ "สถานะของทรัพยากรในระบบ" ไม่ใช่ "status code ที่ตอบกลับ"
   หลังเรียกครั้งแรกและครั้งที่สอง รายการนั้น "ไม่มีอยู่ในระบบ" เหมือนกันทั้งคู่ (state สุดท้าย
   เหมือนกันทุกครั้งที่เรียกซ้ำ) แม้ status code จะต่างกัน (204 ตอนลบสำเร็จ, 404 ตอนไม่เจอเพราะ
   ถูกลบไปแล้ว) DELETE ก็ยังถือเป็น idempotent operation ตามนิยามมาตรฐาน (RFC 7231)
*/
