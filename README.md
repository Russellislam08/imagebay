## Image Bay
### A platform to upload, share, buy and sell images

A live version deployed on Heroku can be found [here](https://whispering-bayou-81502.herokuapp.com/)

This application was made for the Shopify coding challenge for my application. It is a web application which allows users to create an account in order to upload images. Users can then list those images on the marketplace in order to sell it, while also being able to purchase images listed by other users. 

### Technologies Used
The application is built using Node.js. The backend server is created using Express as the web application framework, along with Passport.js for user authentication. EJS is used with HTML and CSS for the frontend. MongoDB is used to store user data along with image metadata. Lastly, Amazon S3 is used to store all uploaded images and binary data.

### How To Set It Up
If you are looking to set up the application on your machine, you would need the following:
- Node.js (and consequently, npm) version 16.X and up
- A MongoDB database if you have one already, or alternatively, an account, which you can create [here](https://www.mongodb.com/cloud/atlas/signup)
- An AWS account which you can also create [here](https://aws.amazon.com/), if you don't have one already. This is used to store images so that users can download them later.

First, you would need to download the source code. Next, you would need to make a `config/default.json` file which would store all necessary configuration data. This file would store your Mongo URI as well as AWS configuration data. An example would be like:
```
{
  "mongoURI": "",
  "awsS3": {
    "bucketRegion": "",
    "accessKeyId": "",
    "secretAccessKey": ""
  },
  "s3Bucket": ""
}
```
Instructions for setting up a mongoDB cluster can be found [here](https://docs.atlas.mongodb.com/tutorial/create-new-cluster/), if needed. A small cluster can be created for free.

You would also need to make an S3 bucket on AWS, instructions for that can be found [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)

Once those are all set up, navigate to the root directory of the source code and execute the command `npm install`. This will install all dependencies needed to run the application. Once completed, simply execute `npm start` and the application will begin running.

### How It Works

To use it, users simply need to register an account with a username, email and a password. Once registered, users will be logged in and will be presented with the option to upload any image, or to purchase any image from the marketplace, if any are available for purchase







