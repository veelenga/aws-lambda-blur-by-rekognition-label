# AWS Lambda Blur By Rekognition Label

AWS Lambda to blurs objects detected by [AWS Rekognition](https://aws.amazon.com/rekognition/).

## Usage

``` sh
$ npm install
$ AWS_ACCESS_KEY_ID=xxx \
  AWS_SECRET_ACCESS_KEY=xxx \
  REKOGNITION_LABELS="house, person" \
  S3_BUCKET_NAME=person-blurring \
  S3_OBJECT_KEY=samples/baucam-007-2020-09-23_08_20_02.521.jpg \
  ./run.sh
```

## Configuration

Lambda environment can be configured using [env variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html):

* `S3_BUCKET_NAME` - a bucket to take image from for processing.
* `S3_OBJECT_KEY` - a key that identifies the object for processing.
* `S3_DESTINATION_DIR` - directory to put processed objects to.
* `REKOGNITION_LABELS` - lambda will blur objects, labeled only by specified list of labels.
* `REKOGNITION_MIN_CONFIDENCE` - changes the [MinConfidence](https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectLabels.html#API_DetectLabels_RequestSyntax) parameter to detect labels in AWS Rekognition.

## Deployment

[AWS Lambda deployment package in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)
