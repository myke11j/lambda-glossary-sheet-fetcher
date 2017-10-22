# lambda-glossary-sheet-fetcher

Fetches data from Google Spreadsheet

## Set up

#### Get Google API access token

Our lambda will be accessing a Google sheet via Service Account. So, you need to have a service token, which is a JSON object.

Here are the steps to do this:

- Click [here](https://console.developers.google.com/start/api?id=sheets.googleapis.com) to go to developer console.
- Select/create a project and go to credentials tab.
- Click on Create Credentials -> Service Account
- Enter a unique name here, as service account.
- After submitting you will get a JSON (note, you can't download this again, so save this cope somewhere safe)

We will be useing this JSON in next steps, so hold on to it.

#### lambda-glossary-sheet-fetcher

- Install node-lambda package, `npm i -g node-lambda`
- `npm i --production` in the working directory
- Create `.env` and `deploy.env` files, follow format from `.env.sample` and `deploy.env.sample` files
- In place of `GOOGLE_ACCESS_TOKEN`, add the above token you recieved.
- Run `npm run dev:lambda`
- Your shell should show, the number of rows read.

## Deploying

For deploying, refer deploy guide on [node-lambda](https://www.npmjs.com/package/node-lambda)

```
npm run dev:lambda-deploy
```