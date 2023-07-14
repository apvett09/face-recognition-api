const handleRegister = (req, res, db, bcrypt) => {
  // Check the database connection
  if (!db.client.pool || typeof db.client.pool.acquire !== "function") {
    return res.status(500).json("Unable to connect to the database");
  }

  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  if (!email || !name || !password) {
    return res.status(400).json("incorrect form submission.");
  }
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(500).json("Unable to register user"));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(500).json("Unable to access database"));
};

module.exports = {
  handleRegister: handleRegister,
};
