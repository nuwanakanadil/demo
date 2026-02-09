const cloudinary = require("../config/cloudinary");

const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { deleteFromCloudinary };
