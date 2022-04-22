#! /bin/node
const swaggerJsdoc = require("swagger-jsdoc");
const { writeFileSync } = require("fs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Generate thumbnail",
      version: "1.0.0",
    },
  },
  apis: ["./src/*.ts", "create-thumbnail/*.js"], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);
writeFileSync("./openapi.json", JSON.stringify(openapiSpecification));
