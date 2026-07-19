import { useEffect, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

interface Task { id: number; title: string; done: boolean; }

export default function Tasks() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const r = await api.get("/tasks");
    setTasks(r.data);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim()) return;
    await api.post("/tasks", { title });
    setTitle("");
    load();
  };
  const toggle = async (t: Task) => {
    await api.put(`/tasks/${t.id}`, { done: !t.done });
    load();
  };
  const remove = async (id: number) => {
    await api.delete(`/tasks/${id}`);
    load();
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>My Tasks</h2>
        <button onClick={logout}>Log out</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input placeholder="new task" value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }} />
        <button onClick={add}>Add</button>
      </div>
      {tasks.map((t) => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: 4 }}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
          <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
          <button onClick={() => remove(t.id)}>x</button>
        </div>
      ))}
    </div>
  );
}
