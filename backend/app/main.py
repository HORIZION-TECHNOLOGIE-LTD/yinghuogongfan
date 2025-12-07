from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import redis
from rq import Queue
from uuid import uuid4
from .tasks import enqueue_generate_image, get_job_status
from .schemas import GenerateImageRequest
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)
q = Queue(connection=r)

app = FastAPI(title="Surfsense Backend (demo)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/generate/image")
async def generate_image(req: GenerateImageRequest):
    """
    Submit image generation task. For demo, worker will create a placeholder image with prompt text.
    Returns task_id to poll.
    """
    task_id = str(uuid4())
    job = q.enqueue(enqueue_generate_image, req.prompt, req.width, req.height, req.format, job_id=task_id)
    return {"task_id": job.get_id(), "status": "queued"}

@app.get("/api/v1/tasks/{task_id}")
async def task_status(task_id: str):
    status = get_job_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="task not found")
    return status

@app.post("/api/v1/notes")
async def create_note(payload: dict):
    # Minimal placeholder: you should replace with persisted DB + CRDT support
    # For demo we simply echo back
    return {"ok": True, "note": payload}
