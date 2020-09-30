const async = require('async'),
      AWS = require('aws-sdk'),
      gm = require('gm').subClass({ imageMagick: true });

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

const S3_DESTINATION_DIR = process.env.S3_DESTINAION_DIR || 'blurred';
const REKOGNITION_PROJECT_VERSION_ARN = process.env.REKOGNITION_PROJECT_VERSION_ARN;
const REKOGNITION_MIN_CONFIDENCE = process.env.REKOGNITIN_MIN_CONFIDENCE || 55;
const REKOGNITION_LABELS = (process.env.REKOGNITION_LABELS || 'Person')
  .split(',')
  .map((label) => label.trim())
  .map((label) => label.charAt(0).toUpperCase() + label.slice(1).toLowerCase());

/**
 * Call to DetectLabels API
 *
 * https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectLabels.html
 */
function detectLabels(response, image, callback) {
  var params = {
    Image: image,
    MinConfidence: REKOGNITION_MIN_CONFIDENCE
  };

  rekognition.detectLabels(params, (err, data) => {
    if (err){
      callback(err);
    } else {
      let instances = data.Labels.reduce((acc, label) => (
        REKOGNITION_LABELS.includes(label["Name"]) ? acc.concat(label.Instances) : acc
      ), [])

      callback(null, response, instances);
    }
  });
}

/**
 * Call to DetectCustomLabels API
 *
 * https://docs.aws.amazon.com/rekognition/latest/dg/API_DetectCustomLabels.html
 */
function detectCustomLabels(response, image, callback) {
  var params = {
    Image: image,
    MinConfidence: REKOGNITION_MIN_CONFIDENCE,
    ProjectVersionArn: REKOGNITION_PROJECT_VERSION_ARN
  };

  rekognition.detectCustomLabels(params, (err, data) => {
    if (err){
      callback(err);
    } else {
      let geometries = data.CustomLabels.reduce((acc, label) => (
        REKOGNITION_LABELS.includes(label["Name"]) ? acc.concat(label.Geometry) : acc
      ), [])

      callback(null, response, geometries);
    }
  });
}

exports.handler = (event, context, callback) => {
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey    = event.Records[0].s3.object.key;

  async.waterfall([
    function download(next) {
      s3.getObject({ Bucket: srcBucket, Key: srcKey }, next);
    },

    function collectLabelBoundingBoxes(response, next) {
      let image = { S3Object: { Bucket: srcBucket, Name: srcKey } };
      REKOGNITION_PROJECT_VERSION_ARN
        ? detectCustomLabels(response, image, next)
        : detectLabels(response, image, next);
    },

    function blur(response, instancesToBlur, next) {
      let img = gm(response.Body);
      img.size(function(err, value){
        if (err) {
          next(err);
        } else {
          instancesToBlur.forEach((object) => {
            const box    = object.BoundingBox,
                  width  = box.Width * value.width,
                  height = box.Height * value.height,
                  left   = box.Left * value.width,
                  top    = box.Top * value.height;

            img.region(width, height, left, top).sepia();
          });

          img.toBuffer(function(err, buffer) {
            if(err) {
              next(err);
            } else {
              next(null, response.ContentType, buffer);
            }
          });
        }
      });
    },

    function putObject(contentType, buffer, next) {
      let dest = srcKey.split("/");
      dest.shift();
      dest.unshift(S3_DESTINATION_DIR);

      let destKey = dest.join("/");

      let obj = { Bucket: srcBucket, Key: destKey, Body: buffer, ContentType: contentType };

      s3.putObject(obj, function(err, result) {
        if (err) {
          next(err);
        } else {
          next(null);
        }
      });
    }
  ],

  function (err) {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      callback(null, 'success');
    }
  });
};
