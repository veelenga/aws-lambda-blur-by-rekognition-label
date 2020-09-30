#!/bin/sh

if [ ! -d "layers/im" ]; then
  # compile and copy the ImageMagick layer
  repo_dir=$PWD
  im_dir=$repo_dir/layers/im
  git clone https://github.com/serverlesspub/imagemagick-aws-lambda-2 $im_dir/sources && cd $im_dir/sources
  make all && cd $repo_dir
  mv $im_dir/sources/result/* $im_dir
  rm -rf $im_dir/sources
fi

docker run --rm \
  -e AWS_REGION \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  -e S3_DESTINAION_DIR \
  -e REKOGNITION_PROJECT_VERSION_ARN \
  -e REKOGNITION_LABELS \
  -v $PWD:/var/task \
  -v $PWD/layers/im:/opt lambci/lambda:nodejs12.x \
    index.handler "{\"Records\":[{\"s3\": {\"bucket\": {\"name\":\"$S3_BUCKET_NAME\"}, \"object\": {\"key\":\"$S3_OBJECT_KEY\"}}}]}"
