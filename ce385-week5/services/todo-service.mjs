// services/todo-service.mjs
// ชั้นกฎธุรกิจ — ต้องไม่พึ่งพา web framework ใด ๆ และไม่พิมพ์ log ใด ๆ ในไฟล์นี้
import { AppError } from "../middlewares/error-handler.mjs";
import * as todoData from "../data/todo-data.mjs";

const ALLOWED_PRIORITY = ["high", "normal", "low"];

function assertValidInput({ title, priority }) {
  if (typeof title !== "string" || title.trim() === "") {
    throw new AppError(400, "title ต้องเป็น string และห้ามว่าง");
  }
  if (priority !== undefined && !ALLOWED_PRIORITY.includes(priority)) {
    throw new AppError(400, "priority ต้องเป็น high, normal หรือ low เท่านั้น");
  }
}

export function list({ done, q, sort } = {}) {
  let result = todoData.getAll();
  if (done !== undefined) {
    const wantDone = done === "true";
    result = result.filter((t) => t.done === wantDone);
  }
  if (q) {
    const keyword = String(q).toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(keyword));
  }
  if (sort === "title") {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, "th"));
  }
  return { total: result.length, items: result };
}

export function getOne(id) {
  const todo = todoData.getById(id);
  if (!todo) throw new AppError(404, `ไม่พบรายการ ${id}`);
  return todo;
}

export function create(body = {}) {
  assertValidInput(body);
  if (todoData.findByTitle(body.title)) {
    throw new AppError(409, `มีรายการชื่อ "${body.title}" อยู่แล้ว`);
  }
  return todoData.insert({
    title: body.title,
    done: Boolean(body.done ?? false),
    priority: body.priority ?? "normal",
  });
}

export function replace(id, body = {}) {
  assertValidInput(body);
  const todo = todoData.updateById(id, {
    title: body.title,
    done: Boolean(body.done ?? false),
    priority: body.priority ?? "normal",
  });
  if (!todo) throw new AppError(404, `ไม่พบรายการ ${id}`);
  return todo;
}

export function remove(id) {
  const ok = todoData.removeById(id);
  if (!ok) throw new AppError(404, `ไม่พบรายการ ${id}`);
}
