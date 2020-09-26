#!/bin/sh

if [ ! -d "layers/im" ]; then
  # compile and copy the ImageMagick layer
  # https://github.com/serverlesspub/imagemagick-aws-lambda-2
  git clone https://github.com/serverlesspub/imagemagick-aws-lambda-2 layers/im/sources && cd layers/im/sources
  make all && cd ../ && mv sources/result ./
  rm -rf sources
fi

docker run --rm \
  -e AWS_REGION \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -e REKOGNITION_LABLES \
  -v $PWD:/var/task \
  -v $PWD/layers/im:/opt lambci/lambda:nodejs12.x \
    index.handler "{\"Records\":[{\"s3\": {\"bucket\": {\"name\":\"$S3_BUCKET_NAME\"}, \"object\": {\"key\":\"$S3_OBJECT_KEY\"}}}]}"
