const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProduct,
  fetchFavorite,
  deleteFavorite,
} = require("./db");
const express = require("express");
const app = express();

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProduct());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorite(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res
      .status(201)
      .send(
        await createFavorite({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await deleteFavorite({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

async function init() {
  //get client by requiring from db.js and connect
  await client.connect();
  console.log("connected to db");
  await createTables();
  console.log("Tables Created");
  const [joe, alex, angie, seb, ipod, laptop, airfryer, wallet] =
    await Promise.all([
      createUser({ username: "joe", password: "asdf1" }),
      createUser({ username: "alex", password: "asdf1!" }),
      createUser({ username: "angie", password: "asdf1!2" }),
      createUser({ username: "seb", password: "!onetwothree" }),
      createProduct({ name: "ipod" }),
      createProduct({ name: "laptop" }),
      createProduct({ name: "airfryer" }),
      createProduct({ name: "wallet" }),
    ]);
  console.log("joe.id");
  console.log(ipod.id);
  const users = await fetchUsers();
  console.log(users);
  const product = await fetchProduct();
  console.log(product);

  const favorite = await Promise.all([
    createFavorite({ user_id: joe.id, product_id: ipod.id }),
    createFavorite({ user_id: alex.id, product_id: laptop.id }),
    createFavorite({ user_id: angie.id, product_id: airfryer.id }),
    createFavorite({ user_id: seb.id, product_id: wallet.id }),
    createFavorite({ user_id: joe.id, product_id: wallet.id }),
  ]);

  console.log(await fetchFavorite(joe.id));
  await deleteFavorite({ user_id: joe.id, id: favorite[0].id });
  console.log(await fetchFavorite(joe.id));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
}

init();
