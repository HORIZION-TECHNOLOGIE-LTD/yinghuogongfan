from pydantic import BaseModel
from typing import Optional

class GenerateImageRequest(BaseModel):
    prompt: str
    width: Optional[int] = 1024
    height: Optional[int] = 1024
    format: Optional[str] = "png"
    project_id: Optional[str] = None
