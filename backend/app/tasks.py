import os
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from .storage import upload_bytes_to_minio, get_presigned_url
from rq import get_current_job

MINIO_BUCKET = os.getenv("MINIO_BUCKET", "surfsense")

def enqueue_generate_image(prompt: str, width: int = 1024, height: int = 1024, fmt: str = "png"):
    """
    Worker task: generate a simple placeholder image with the prompt drawn on it,
    upload to MinIO, return URL.
    Replace image generation section with calls to your preferred AI image API or local model.
    """
    job = get_current_job()
    job.meta["prompt"] = prompt
    job.save_meta()

    # create a simple image with the prompt text
    img = Image.new("RGB", (max(256, width), max(256, height)), color=(255,255,255))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.load_default()
        d.multiline_text((10,10), prompt[:1000], fill=(0,0,0), font=font)
    except Exception:
        d.text((10,10), prompt[:1000], fill=(0,0,0))

    buf = BytesIO()
    img.save(buf, format=fmt.upper())
    buf.seek(0)

    object_name = f"generated/{{job.get_id()}}.{fmt}"
    upload_bytes_to_minio(buf.read(), object_name, MINIO_BUCKET)

    url = get_presigned_url(object_name, MINIO_BUCKET)
    return {"task_id": job.get_id(), "status": "done", "result_urls": [url]}

def get_job_status(job_id: str):
    from redis import Redis
    from rq.job import Job
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_conn = Redis.from_url(redis_url)
    try:
        job = Job.fetch(job_id, connection=redis_conn)
    except Exception:
        return None

    result = {"task_id": job.get_id(), "status": job.get_status()}
    if job.is_finished:
        result["result"] = job.return_value
    if job.is_failed:
        result["error"] = str(job.exc_info)
    return result
