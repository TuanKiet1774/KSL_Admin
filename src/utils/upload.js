import axios from 'axios';

const IMGBB_API_KEY = '6e1e69c3342d234a5b239cb6ad395349';

export const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
        if (response.data.success) {
            return response.data.data.url;
        } else {
            throw new Error('Upload to ImgBB failed');
        }
    } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        throw error;
    }
};
