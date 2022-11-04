
# Define the application directory
import os
import os.path as Path

# Statement for enabling the development environment
DEBUG = True

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

APP_URL = "0.0.0.0"

PORT = 6050

NODE_DIR = os.path.normpath(os.path.join(__file__,'../../nodeApp'))
