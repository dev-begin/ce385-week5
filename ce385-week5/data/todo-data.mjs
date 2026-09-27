// data/todo-data.mjs
// เก็บข้อมูลไว้เป็นตัวแปร private ของโมดูลนี้เท่านั้น
// ห้าม export ตัว array ตรง ๆ (กันไม่ให้ที่อื่น push/splice ทะลุเข้ามาแก้เองได้)
// ไฟล์นี้ต้องไม่พึ่งพา web framework ใด ๆ และไม่พิมพ์ log ใด ๆ

let nextId = 5;
const todos = [
  { id: "1", title: "อ่านหนังสือ CE385", done: false, priority: "high" },
  { id: "2", title: "ทำ Workshop 4", done: false, priority: "high" },
  { id: "3", title: "ซักผ้า", done: true, priority: "low" },
  { id: "4", title: "นัดหมอ", done: false, priority: "normal" },
];

export function getAll() {
  return [...todos];
}

export function getById(id) {
  return todos.find((t) => t.id === id);
}

export function findByTitle(title) {
  return todos.find((t) => t.title.toLowerCase() === title.toLowerCase());
}

export function insert({ title, done, priority }) {
  const item = { id: String(nextId++), title, done, priority };
  todos.push(item);
  return item;
}

export function updateById(id, changes) {
  const todo = getById(id);
  if (!todo) return undefined;
  Object.assign(todo, changes);
  return todo;
}

export function removeById(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}
