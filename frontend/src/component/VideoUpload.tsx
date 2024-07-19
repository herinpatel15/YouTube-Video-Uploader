import React, { ChangeEvent, FormEvent, useState } from 'react';

const VideoUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            setUploadStatus('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        try {
            const response = await fetch('/api/upload-video', {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type here, let the browser set it for FormData
                },
                // onUploadProgress: (progressEvent) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     setUploadProgress(percentCompleted);
                // },
            });

            if (response.ok) {
                const responseData = await response.json();
                setUploadStatus(responseData.folderSizeMB);
                
            } else {
                setUploadStatus('Upload failed');
            }
        } catch (error) {
            console.error('Error:', error);
            setUploadStatus('Upload failed');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept="video/*" />
                <button type="submit">Upload Video</button>
            </form>
            {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
            <p>{uploadStatus}</p>
        </div>
    );
};

export default VideoUpload;