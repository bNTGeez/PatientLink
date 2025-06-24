import os
from boto3 import client as boto3_client
from botocore.exceptions import ClientError

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

def get_s3_client():
  return boto3_client(
      "s3",
      aws_access_key_id=AWS_ACCESS_KEY_ID,
      aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
      region_name=AWS_REGION,
  )

# file_obj is a file object 
# bucket is the name of the S3 bucket
# object_name is the S3 object key/name 
def upload_file(file_obj, bucket, object_name):
  if object_name is None:
    raise ValueError("object_name is required")
  
  s3_client = get_s3_client()
  try:
    s3_client.upload_fileobj(file_obj, bucket, object_name, ExtraArgs={"ACL": "private"})
    return generate_presigned_url(object_name)
  except ClientError as e:
    raise Exception(f"Error uploading file to S3: {e}")

# generate a presigned URL for the file under `key` in your bucket
# param: key: The key of the file in the bucket
# param: expiration: The expiration time of the presigned URL
# param: response_headers: Optional dict of response headers to modify the content disposition
def generate_presigned_url(key: str, expiration: int = 3600, response_headers: dict = None) -> str:
  try:
    s3_client = get_s3_client()
    params = {
      'Bucket': S3_BUCKET_NAME,
      'Key': key
    }

    if response_headers:
      params.update(response_headers)
    
    response = s3_client.generate_presigned_url(
      ClientMethod='get_object',
      Params=params,
      ExpiresIn=expiration
    )
    return response
  except ClientError as e:
    raise Exception(f"Error generating presigned URL: {e}")

def delete_file(bucket_name, object_name):
  s3_client = get_s3_client()
  try:
    s3_client.delete_object(Bucket=bucket_name, Key=object_name)
    return True
  except ClientError as e:
    raise Exception(f"Error deleting file from S3: {e}")

def check_file_exists(bucket_name, object_name):
  s3_client = get_s3_client()
  try:
    s3_client.head_object(Bucket=bucket_name, Key=object_name)
    return True
  except ClientError as e:
    if e.response['Error']['Code'] == '404':
      return False
    else:
      raise Exception(f"Error checking file existence: {e}")


