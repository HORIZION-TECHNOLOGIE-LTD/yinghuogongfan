// Minimal front-end fetch example (can放入 surfsense_web 的某个组件)
async function submitGenerateImage(prompt) {
  const res = await fetch("http://localhost:8000/api/v1/generate/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, width: 1024, height: 1024, format: "png" })
  });
  const data = await res.json();
  return data.task_id;
}

async function pollTask(taskId, interval = 2000, timeout = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}`);
    if (res.status === 404) throw new Error("task not found");
    const body = await res.json();
    if (body.status === "finished" || body.status === "done" || body.task_id) {
      return body.result || body.result_urls || body;
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error("timeout");
}

// usage
// const id = await submitGenerateImage("A minimal product landing page hero, flat design");
// const result = await pollTask(id);
// console.log(result);
