const handleSignin = (req, res, db, bcrypt) => {
  // Check the database connection
  if (!db.client.pool || typeof db.client.pool.acquire !== "function") {
    return res.status(500).json("Unable to connect to the database");
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("incorrect form submission.");
  }
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      if (data.length === 0) {
        // No matching email found in the database
        return res.status(400).json("Invalid credentials");
      }

      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(500).json("Unable to get user"));
      } else {
        res.status(400).json("Invalid credentials");
      }
    })
    .catch((err) => res.status(500).json("Unable to access database"));
};

module.exports = {
  handleSignin: handleSignin,
};
