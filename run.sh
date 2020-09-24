docker run --rm \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e REKOGNITION_LABLES=$REKOGNITION_LABELS \
  -v $PWD:/var/task lambci/lambda:nodejs12.x \
  index.handler "{\"Records\":[{\"s3\": {\"bucket\": {\"name\":\"$S3_BUCKET_NAME\"}, \"object\": {\"key\":\"$S3_OBJECT_KEY\"}}}]}"
