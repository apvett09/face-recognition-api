const fetch = require("node-fetch");

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
};

const returnClarifaiRequestOptions = (imageURL) => {
  const IMAGE_URL = imageURL;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: "your user ID",
      app_id: "your app",
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + "your api key",
    },
    body: raw,
  };
  return requestOptions;
};

const handleAPIcall = (req, res) => {
  fetch(
    `https://api.clarifai.com/v2/models/face-detection/outputs`,
    returnClarifaiRequestOptions(req.body.input)
  )
    .then((response) => response.text())
    .then((result) => {
      res.json(result);
    })
    .catch((err) => res.status(500).json("Unable to communicate with API"));
};

module.exports = {
  handleImage: handleImage,
  handleAPIcall: handleAPIcall,
};
