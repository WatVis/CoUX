const mongoose = require("mongoose");
const ffmpeg = require("fluent-ffmpeg");
const mergeImg = require("merge-img");
const fs = require("fs");

const videoSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    sceneBreaks: [
      {
        type: Number,
        required: true,
      },
    ],
    scrollingSpeed: [
      {
        type: Number,
        required: true,
      },
    ],
    audioSegments: [
      {
        id: {
          type: Number,
          required: true,
        },
        start: {
          type: Number,
          required: true,
        },
        end: {
          type: Number,
          required: true,
        },
        transcript: {
          type: String,
        },
        uxKeywords: [
          {
            type: String,
          },
        ],
        domainKeywords: [
          {
            type: String,
          },
        ],
        semantics: {
          type: String,
          required: true,
        },
        lowSpeechRate: {
          type: Number,
          required: true,
        },
        loudness: {
          type: Number,
          required: true,
        },
        pitch: {
          type: Number,
          required: true,
        },
      },
    ],
    preview: {
      url: {
        type: String,
      },
      thumbCount: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "video",
});

videoSchema.virtual("discussions", {
  ref: "Discussion",
  localField: "_id",
  foreignField: "video",
});

videoSchema.methods.generateThumbnail = async function () {
  return new Promise((resolve, reject) => {
    try {
      const video = this;
      const thumbsFolderPath = `assets/thumbnails/${video.name}`;
      const thumbCount = 1;
      let thumbsFiles = [];

      ffmpeg(video.url)
        .on("filenames", function (filenames) {
          console.log("Will generate " + filenames.join(", "));
        })
        .on("end", function () {
          console.log("Screenshots taken");
          fs.readdirSync(thumbsFolderPath).forEach((file) => {
            if (file !== "out.png")
              thumbsFiles.push(`${thumbsFolderPath}/${file}`);
          });
          var collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: "base",
          });
          mergeImg(thumbsFiles.sort(collator.compare)).then(async (img) => {
            img.write(`${thumbsFolderPath}/out.png`, () => console.log("done"));
            fs.readdirSync(thumbsFolderPath).forEach((file) => {
              if (file !== "out.png")
                fs.unlinkSync(`${thumbsFolderPath}/${file}`);
            });
            video.preview.url = `${thumbsFolderPath.replace(
              " ",
              "%20"
            )}/out.png`;
            video.preview.thumbCount = thumbCount;

            await video.save();
            resolve(video.preview.url);
          });
        })
        .screenshots({
          count: thumbCount,
          folder: thumbsFolderPath,
          size: "270x150",
          filename: "thumbnail-%b.png",
        });
    } catch (err) {
      reject(err);
    }
  });
};

videoSchema.methods.generatePreview = async function () {
  const video = this;
  const thumbsFolderPath = `assets/previews/${video.name}`;
  const thumbCount = 20;
  let thumbsFiles = [];

  ffmpeg(video.url)
    .on("filenames", function (filenames) {
      console.log("Will generate " + filenames.join(", "));
    })
    .on("end", function () {
      console.log("Screenshots taken");
      fs.readdirSync(thumbsFolderPath).forEach((file) => {
        if (file !== "out.png") thumbsFiles.push(`${thumbsFolderPath}/${file}`);
      });
      var collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
      });
      mergeImg(thumbsFiles.sort(collator.compare)).then(async (img) => {
        img.write(`${thumbsFolderPath}/out.png`, () => console.log("done"));
        fs.readdirSync(thumbsFolderPath).forEach((file) => {
          if (file !== "out.png") fs.unlinkSync(`${thumbsFolderPath}/${file}`);
        });
        video.preview.url = `${thumbsFolderPath.replace(" ", "%20")}/out.png`;
        video.preview.thumbCount = thumbCount;

        await video.save();
      });
    })
    .screenshots({
      count: thumbCount,
      folder: thumbsFolderPath,
      size: "270x150",
      filename: "thumbnail-%b.png",
    });
};

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
