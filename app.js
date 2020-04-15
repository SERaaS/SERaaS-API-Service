'use strict';

const SwaggerExpress = require('swagger-express-mw'),
  app = require('express')(),
  cors = require('cors');

app.use(cors());

module.exports = app; // for testing

const config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  const port = process.env.PORT || 5000;
  app.listen(port);
});
