import os
import shutil
import urllib.request
import zipfile
from pathlib import Path
import ssl

def install_ffmpeg():
    zip_path = "ffmpeg.zip"
    
    if not os.path.exists(zip_path):
        print("Downloading FFmpeg (Essentials)...")
        url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
        # Disable SSL verify for this script just in case
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(url, context=ctx) as response, open(zip_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        print("Download complete.")
    else:
        print("ffmpeg.zip found. Skipping download.")

    print("Extracting...")
    # Extract
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall("ffmpeg_temp")
            
        # Find ffmpeg.exe in the extracted folders
        ffmpeg_exe = None
        for root, dirs, files in os.walk("ffmpeg_temp"):
            if "ffmpeg.exe" in files:
                ffmpeg_exe = os.path.join(root, "ffmpeg.exe")
                break
                
        if ffmpeg_exe:
            target = "ffmpeg.exe"
            if os.path.exists(target):
                try:
                    os.remove(target)
                except:
                    pass
            shutil.move(ffmpeg_exe, target)
            print("Success: ffmpeg.exe moved to project root.")
        else:
            print("Error: ffmpeg.exe not found in downloaded archive.")
            
    except zipfile.BadZipFile:
        print("Error: Zip file is corrupt.")

    # Cleanup
    if os.path.exists(zip_path):
        try:
            os.remove(zip_path)
        except:
            pass
    if os.path.exists("ffmpeg_temp"):
        try:
            shutil.rmtree("ffmpeg_temp")
        except:
            pass

if __name__ == "__main__":
    install_ffmpeg()
