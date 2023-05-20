const mongoose = require("mongoose");
const Document = require("./Document");

//connect bruh
async function dbconnect() {
  try {
    await mongoose.connect(
      "mongodb+srv://root:root@cluster0.hz1de1c.mongodb.net/google-docs?retryWrites=true&w=majority"
    );
    console.log("connected");
  } catch (error) {
    console.log(error);
  }
}

//hosting bruh
dbconnect();
const io = require("socket.io")(3001, {
  cors: {
    origin: "*:*",
    methods: ["GET", "POST"],
  },
});
const defaultValue = "";
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
