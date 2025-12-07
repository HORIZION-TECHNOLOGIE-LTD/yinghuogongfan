import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from urllib.parse import urljoin

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "surfsense")

s3 = boto3.resource(
    's3',
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name='us-east-1'
)

def ensure_bucket(bucket_name):
    try:
        s3.meta.client.head_bucket(Bucket=bucket_name)
    except ClientError:
        s3.create_bucket(Bucket=bucket_name)

def upload_bytes_to_minio(data: bytes, object_name: str, bucket_name: str = MINIO_BUCKET):
    ensure_bucket(bucket_name)
    obj = s3.Object(bucket_name, object_name)
    obj.put(Body=data)
    return True

def get_presigned_url(object_name: str, bucket_name: str = MINIO_BUCKET, expires_in=3600):
    client = boto3.client(
        's3',
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='us-east-1'
    )
    return client.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': object_name}, ExpiresIn=expires_in)
