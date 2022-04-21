const handle = require("./handler");
const {
  existsSync,
  statSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  rmSync,
} = require("fs");

const { join } = require("path");

const validThumb = {
  gmsAvatarUrl: [
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg",
  ],
  playersAvatarUrls: [
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg",
  ],
  title: "Squawk",
  episodeTitle: "Squaaaaawwwk",
  episodeIndex: 1,
  backgroundUrl:
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg",
  logoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg",
};
describe("Create Thumbnail handler", () => {
  // Copying all assets
  beforeAll(() => {
    copyRecursiveSync(join(__dirname, "../assets"), join(__dirname, "assets"));
  });
  it("dd", async () => {
    const res = await handle(
      {
        path: "/thumb-rpg/",
        body: validThumb,
      },
      new MockFunctionContext()
    );
    console.log(res.value);
  }, 200000);
  // Deleting all assets
  afterAll(() => {
    rmSync(join(__dirname, "assets"), { recursive: true, force: true });
  });
});

function copyRecursiveSync(src, dest) {
  const exists = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    mkdirSync(dest);
    readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
    });
  } else {
    copyFileSync(src, dest);
  }
}

class FunctionEvent {
  constructor(req) {
    this.body = req.body;
    this.headers = req.headers;
    this.method = req.method;
    this.query = req.query;
    this.path = req.path;
  }
}

/**
 * Mocking the OpenFaaS function context without the callback to
 * the runtime
 */
class MockFunctionContext {
  constructor() {
    this.statusCode = 200;
    this.headerValues = {};
    this.value = "";
  }

  status(statusCode) {
    if (!statusCode) {
      return this.statusCode;
    }

    this.statusCode = statusCode;
    return this;
  }

  headers(value) {
    if (!value) {
      return this.headerValues;
    }

    this.headerValues = value;
    return this;
  }

  succeed(value) {
    this.value = value;
    return this;
  }

  fail(value) {
    this.value = value;
    return this;
  }
}
