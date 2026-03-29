
import os
from moviepy.video.io.VideoFileClip import VideoFileClip

def compress_video(input_path, output_path):
    print(f"Processing: {input_path}")
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return False
        
    try:
        clip = VideoFileClip(input_path)
        # Resize to 480p height, keeping aspect ratio
        if clip.h > 480:
            clip = clip.resized(height=480)
        
        # Write video file with reduced bitrate/preset
        # crf=28 is lower quality but small size. preset='faster' speeds it up.
        clip.write_videofile(
            output_path, 
            codec='libx264', 
            audio_codec='aac', 
            fps=24,
            preset='faster',
            ffmpeg_params=['-crf', '28']
        )
        clip.close()
        print(f"Created: {output_path}")
        return True
    except Exception as e:
        print(f"Failed to compress {input_path}: {e}")
        return False

def main():
    public_dir = os.path.join(os.getcwd(), 'public')
    videos = [
        'drop-down.mov',
        'picture-connect.mov',
        'type.mov',
        'voice.mov'
    ]
    
    for video in videos:
        input_path = os.path.join(public_dir, video)
        output_filename = video.replace('.mov', '.mp4')
        output_path = os.path.join(public_dir, output_filename)
        
        if compress_video(input_path, output_path):
            # Verify size
            size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"Size: {size_mb:.2f} MB")
            
            # Remove original if successful
            # os.remove(input_path) # Let's keep manual removal for safety until verified
            print(f"Original {video} kept for safety.")

if __name__ == "__main__":
    main()
