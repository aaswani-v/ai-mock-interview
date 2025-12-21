# Render Build Script for Backend
# This installs dependencies and sets up the environment

# Install Python dependencies
pip install -r requirements.txt

# Install system dependencies for OpenCV (headless version is better for servers)
pip uninstall -y opencv-python
pip install opencv-python-headless==4.9.0.80
