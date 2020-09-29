# AWS Lambda Blur By Rekognition Label

AWS Lambda to blurs objects detected by [AWS Rekognition](https://aws.amazon.com/rekognition/).

Supports regular [`detectLabels`](https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectLabels.html)
or [`detectCustomLabels`](https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectCustomLabels.html) API.

![](https://github.com/veelenga/aws-lambda-blur-by-rekognition-label/blob/master/assets/demo.jpeg)
<sup>
 [Credits <unsplash.com>](https://unsplash.com/photos/_dR2NANY4o)
</sup>

## Usage

1. Install the deps:

``` sh
$ npm install
```

2. To hit `detectLabels` API:

``` sh
$ AWS_REGION='eu-west-1' \
  AWS_ACCESS_KEY_ID=xxx \
  AWS_SECRET_ACCESS_KEY=xxx \
  REKOGNITION_LABELS='house, person' \
  S3_BUCKET_NAME='person-blurring' \
  S3_OBJECT_KEY='samples/photo-1600897457790-4ee13456bfc5.jpeg' \
  ./run.sh
```

3. To hit `detectCustomLabels` API:

``` sh
$ AWS_REGION='eu-west-1' \
  AWS_ACCESS_KEY_ID=xxx \
  AWS_SECRET_ACCESS_KEY=xxx \
  REKOGNITION_PROJECT_VERSION_ARN=xxx \
  REKOGNITION_LABELS='Builder' \
  S3_BUCKET_NAME='person-blurring' \
  S3_OBJECT_KEY='samples/photo-1600897457790-4ee13456bfc5.jpeg' \
  ./run.sh
```

On a first run it will build the ImageMagick layer which is required for local development only.
If you don't want to run it locally, skip this step and deploy the lambda on AWS.

## Configuration

Lambda environment can be configured using [env variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html):

* `S3_BUCKET_NAME` - a bucket to take image from for processing. **Required if running locally**.
* `S3_OBJECT_KEY` - a key that identifies the object for processing. **Required if running locally**.
* `S3_DESTINATION_DIR` - directory to put processed objects to. **Defaults to `blurred`**.
* `REKOGNITION_LABELS` - lambda will blur objects, labeled only by specified list of labels. **Defaults to `Person`**.
* `REKOGNITION_MIN_CONFIDENCE` - changes the [MinConfidence](https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectLabels.html#API_DetectLabels_RequestSyntax) parameter to detect labels in AWS Rekognition. **Defaults to `55`**.
* `REKOGNITION_PROJECT_VERSION_ARN` - the project version ARN of a model to hit the `detectCustomLabels` instead of `detectLabels` API. **Defaults to `nil`**.

None of the variables above are required.

## Deployment

[AWS Lambda deployment package in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)

### Dependent layers

 * ImageMagick - https://github.com/serverlesspub/imagemagick-aws-lambda-2
 * GraphicsMagick - https://github.com/rpidanny/gm-lambda-layer

### Required configuration

* must have the execution role which has permissions to use AWS Rekognition
* must have the execution role which has permissions to read and write to S3 bucket
* must have the S3 trigger which doesn't lead to recursive invocation
* S3 bucket and AWS Rekognition must be in the same region
* lambda can timeout on images with high resolution, timeout must be increased
* to be able to use a custom labels, the model must be started manually. Example:

``` sh
$ aws rekognition start-project-version \                                                                                                                                                                       ⏎ ✹
  --project-version-arn "$PROJECT_VERSION_ARN" \
  --min-inference-units 1 \
  --region eu-west-1
```
