/**
 * Converts various YouTube URL formats to the standard embed URL.
 * @param {string} url The original YouTube URL.
 * @returns {string|null} The embed URL, or null if invalid YouTube URL.
 */
export const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Regular expressions for various YouTube URL patterns
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0`;
    }
    
    return null;
};

/**
 * Checks if a URL is a YouTube URL.
 */
export const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
};
