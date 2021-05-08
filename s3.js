const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const config = require("config");

const s3 = new S3(config.get("awsS3"));

// upload file to s3
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: config.get("s3Bucket"),
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

// delete file from s3

function deleteFile(key) {
  const deleteParams = {
    Bucket: config.get("s3Bucket"),
    Key: key,
  };

  return s3.deleteObject(deleteParams).promise();
}

exports.deleteFile = deleteFile;
