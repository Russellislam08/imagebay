## Image Bay
### A platform to upload, share, buy and sell images

A live version deployed on Heroku can be found [here](https://whispering-bayou-81502.herokuapp.com/).

This application was made for the Shopify Fall 2021 Developer coding challenge. It is a web application which allows users to create an account in order to upload images. Users can then list those images on the marketplace in order to sell it, while also being able to purchase images listed by other users. 


### Technologies Used
The application is built using Node.js. The backend server is created using Express as the web application framework, along with Passport.js for user authentication. EJS is used with HTML and CSS for the frontend. MongoDB is used to store user data along with image metadata and to manage the image marketplace. Lastly, Amazon S3 is used to store all uploaded images and binary data.

### What It Can Do
Image Bay currently supports
- Secure user registration and authentication.
- Secure image upload. Only the author of the image can view their own images. Images are stored on S3 upon upload.
- Complete image CRUD functionality. Users can update images, and remove images. Removing images also removes the image from S3.
- Buying and selling images
  - Every user starts with $100.
  - A user can choose any of their own images to list on the marketplace for some value. Users may also remove their images from the marketplace, should they require.
  - A user can purchase any other image from the marketplace, granted the user has enough funds.
  - Upon any transaction, both users' balances are updated accordingly. 

### How It Works

To use it, users simply need to register an account with a username, email and a password. Once registered, users will be logged in and will be presented with the option to upload any image, or to purchase any image from the marketplace, if any are available for purchase. Upon account creation, the user's dashboard will appear as so:

![homepage](screenshots/homepage.png)

Users can upload an image by simply clicking the button to upload an image. This takes the user to a page with a form where they can specify any data. Users can then select any image file from their system to upload to Image Bay.

![upload](screenshots/upload.png)

And after uploading a few images, your dashboard could look something like:

![withImages](screenshots/withImages.png)

You can click on any photo to get more details, and the option to edit, delete, or list the image for sale. Let's list our cat image for sale.

![show](screenshots/show.png)


To view the marketplace, simply click the option to view the marketplace and you can see any photos other people have listed, as well as any photos that you have listed.

![market](screenshots/market.png)

And you can click on any photo to view more details, and to purchase if you have enough funds.

![purchase](screenshots/purchase.png)

Look at that, we have $100 and the image is only $45. Let's purchase it.

![purchased](screenshots/purchased.png)

And we can see that we have purchased the image. It is in our inventory and we can see that our balance in the top right has now decreased since we used our funds to acquire the image.

This is just a simple flow of how the application can be used.


### How To Set It Up
To set up the application locally on your machine, you would need the following:
- Node.js (and consequently, npm) version 16.X and up
- A MongoDB database if you have one already, or alternatively, an account, which you can create [here](https://www.mongodb.com/cloud/atlas/signup)
- An AWS account which you can also create [here](https://aws.amazon.com/), if you don't have one already. This is used to store images so that users can download them later.

First, download the source code via git or simply downloading as a zip file (unzip it if this is the route taken). Next, create a `config/default.json` file in the root directory which would store all necessary configuration data. This file would store Mongo URI data as well as AWS configuration data. An example would be like:
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

An S3 bucket on AWS is required as well, instructions for that can be found [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)

Once those are all set up, navigate to the root directory of the source code and execute the command `npm install`. This will install all dependencies needed to run the application. Once completed, simply execute `npm start` and the application will begin running. By default, the server listens on port 5000, but this can be easily changed in the `app.js` file, if required


### Next Steps
Currently, the platform simply allows you to have an inventory. Although you can purchase images from other users, there is no sense of who the original owner is. I would like to add an NFT system using blockchain where users can view the original uploader, and look at the path the image has taken to be where it is now. This can add a sense of rarity to certain images which would provide a genuine sense of value.

### Testing
There are a few unit tests powered by Jest, specifically testing AWS functionality. Simply run `npm test` to execute the unit tests.
