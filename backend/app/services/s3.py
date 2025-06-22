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
    return generate_presigned_url(bucket, object_name)
  except ClientError as e:
    raise Exception(f"Error uploading file to S3: {e}")

# bucket_name is the name of the S3 bucket
# object_name is the name of the object to generate a presigned URL for
# expiration is the time in seconds for the presigned URL to remain valid 
def generate_presigned_url(bucket_name, object_name, expiration=3600):
  s3_client = get_s3_client()
  try:
    response = s3_client.generate_presigned_url(
      "get_object",
      Params={"Bucket": bucket_name, "Key": object_name},
      ExpiresIn=expiration,
    )
  except ClientError as e:
      raise Exception(f"Error generating presigned URL: {e}")
  
  return response

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


