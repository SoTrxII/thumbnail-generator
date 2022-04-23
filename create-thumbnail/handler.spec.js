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

describe("Create Thumbnail handler", () => {
  // Copying all assets
  beforeAll(() => {
    copyRecursiveSync(join(__dirname, "../assets"), join(__dirname, "assets"));
  });
  it("Error on unknown preset", async () => {
    const res = await handle(
      {
        path: "/unknown",
        body: validThumb,
        query: {},
      },
      new MockFunctionContext()
    );
    expect(res.statusCode).toBe(400);
    expect(res.value.message).toContain("unknown");
  });
  it("Error on root call", async () => {
    const res = await handle(
      {
        path: "/",
        body: validThumb,
      },
      new MockFunctionContext()
    );
    expect(res.statusCode).toBe(400);
    expect(res.value.message.toLowerCase()).toContain("no preset");
  });
  it("Default options value", async () => {
    const res = await rpgThumbReq();
    expect(res.statusCode).toBe(200);
    expect(res.value).toBeInstanceOf(Buffer);
    expect(res.value.length).toBeGreaterThan(0);
  }, 20000);
  describe("Invalid options", () => {
    it("optimizeImage", async () => {
      const res = await rpgThumbReq({
        query: {
          optimizeImage: 1,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.value.message).toContain("optimizeImage");
      const res2 = await rpgThumbReq({
        query: {
          optimizeImage: "ddd",
        },
      });
      expect(res2.statusCode).toBe(400);
      expect(res2.value.message).toContain("optimizeImage");
    });
    it("size :: 0", async () => {
      const res = await rpgThumbReq({
        query: {
          width: 0,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.value.message).toContain("width");
    });
    it("size :: negative", async () => {
      const res = await rpgThumbReq({
        query: {
          width: -22323323,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.value.message).toContain("width");
    });
    it("height", async () => {
      const res = await rpgThumbReq({
        query: {
          width: "height",
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.value.message).toContain("height");
    });
  });
  describe("Preset :: Thumb-RPG", () => {
    it("Ok on normal conditions", async () => {
      const res = await rpgThumbReq();
      expect(res.statusCode).toBe(200);
      expect(res.value).toBeInstanceOf(Buffer);
      expect(res.value.length).toBeGreaterThan(0);
    }, 200000);

    // Deleting all assets
    afterAll(() => {
      rmSync(join(__dirname, "assets"), { recursive: true, force: true });
    });
  });
});

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

/**
 * Request a thumbnail with rpg preset
 * @param opt
 */
async function rpgThumbReq(opt) {
  const query = opt?.query ?? {};
  const body = opt?.body ?? validThumb;
  return await handle(
    {
      path: "/thumb-rpg/",
      body: body,
      query: query,
    },
    new MockFunctionContext()
  );
}

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
