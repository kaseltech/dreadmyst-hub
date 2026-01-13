-- Add YouTube video ID column to builds table
ALTER TABLE builds ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN builds.youtube_video_id IS 'YouTube video ID for embedded build showcase video';
