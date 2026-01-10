const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Supabase URL or Key missing. Storage functions will be mocked.');
}

const uploadFile = async (bucket, folder, filePath, mimeType = 'application/pdf') => {
    if (!supabase) {
        console.warn(`Mocking upload for ${filePath} to ${bucket}/${folder}`);
        return { data: { path: `${folder}/${path.basename(filePath)}` }, error: null };
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = `${folder}/${Date.now()}-${path.basename(filePath)}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, fileBuffer, {
                upsert: true,
                contentType: mimeType // Use provided mimeType or default to PDF
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return {
            data: {
                path: fileName,
                publicUrl: publicUrlData.publicUrl
            },
            error: null
        };
    } catch (error) {
        console.error('Supabase upload error:', error);
        return { data: null, error };
    }
};

// Helper to check if a path is a Supabase URL
const isSupabaseUrl = (filePath) => {
    if (!filePath) return false;
    return filePath.startsWith('http://') || filePath.startsWith('https://');
};

// Helper to download a file from URL and return as buffer
const downloadFileFromUrl = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Error downloading file from URL:', error);
        throw error;
    }
};

// Helper to delete file from Supabase
const deleteFile = async (bucket, pathInBucket) => {
    if (!supabase) {
        console.warn(`Mocking delete for ${pathInBucket} from ${bucket}`);
        return { data: {}, error: null };
    }

    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .remove([pathInBucket]);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Supabase delete error:', error);
        return { data: null, error };
    }
};

module.exports = { supabase, uploadFile, isSupabaseUrl, downloadFileFromUrl, deleteFile };
