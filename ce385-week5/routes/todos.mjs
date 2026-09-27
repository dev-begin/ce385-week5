// routes/todos.mjs
// ไฟล์นี้ใช้ path แบบสัมพัทธ์ล้วน ๆ (relative path) ไม่ผูกกับ base path เต็มใด ๆ
// base path ถูกกำหนดตอน mount ในไฟล์หลักเพียงจุดเดียวเท่านั้น handler แต่ละตัวยาวไม่เกิน 4 บรรทัด
import express from "express";
import * as todoService from "../services/todo-service.mjs";

const router = express.Router();

// ห่อ handler async ด้วย wrap เพื่อดัก error ส่งเข้า errorHandler อัตโนมัติ (ดูคำตอบข้อ 4)
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", wrap(async (req, res) => {
  res.json(todoService.list(req.query));
}));

router.get("/:id", wrap(async (req, res) => {
  res.json(todoService.getOne(req.params.id));
}));

router.post("/", wrap(async (req, res) => {
  res.status(201).json(todoService.create(req.body));
}));

router.put("/:id", wrap(async (req, res) => {
  res.json(todoService.replace(req.params.id, req.body));
}));

router.delete("/:id", wrap(async (req, res) => {
  todoService.remove(req.params.id);
  res.status(204).end();
}));

export default router;
