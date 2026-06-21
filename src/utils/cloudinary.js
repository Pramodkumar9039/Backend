import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) {
            console.log("No local file path provided");
            return null;
        }
        
        // Convert to absolute path if relative
        const absolutePath = path.resolve(localFilePath);
        console.log("Resolved file path:", absolutePath);
        
        // Check if file exists
        if(!fs.existsSync(absolutePath)) {
            console.log("File does not exist at path:", absolutePath);
            return null;
        }
        
        console.log("Uploading file from:", absolutePath);
        console.log("Cloudinary config - Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
        
        /// upload the file on cloudinary
        const response = await cloudinary.uploader.upload(absolutePath, {
            resource_type : "auto"
        })
        
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary successfully");
        console.log("Avatar URL:", response.url);
        console.log("Public ID:", response.public_id);
        
        // Delete file after successful upload
        if(fs.existsSync(absolutePath)){
            fs.unlinkSync(absolutePath);
            console.log("Temporary file deleted");
        }
        
        return response;
    }catch (error) {
        console.log("Cloudinary Error - Message:", error.message);
        console.log("Cloudinary Error - Full:", JSON.stringify(error, null, 2));

        if(localFilePath) {
            const absolutePath = path.resolve(localFilePath);
            if(fs.existsSync(absolutePath)){
                try {
                    fs.unlinkSync(absolutePath);
                } catch (deleteError) {
                    console.log("Error deleting temp file:", deleteError.message);
                }
            }
        }

        return null;
    }
}

export { uploadOnCloudinary };