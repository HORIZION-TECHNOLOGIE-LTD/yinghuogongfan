"""
Simple worker entrypoint that listens to the 'default' RQ queue.
Run: python worker.py
In docker-compose it's run as the worker service.
"""
import os
from rq import Worker, Queue, Connection
import redis

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
conn = redis.from_url(redis_url)

if __name__ == "__main__":
    with Connection(conn):
        q = Queue()
        print("Starting worker, listening to default queue...")
        Worker(q).work()
