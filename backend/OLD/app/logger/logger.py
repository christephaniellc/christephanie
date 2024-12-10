import logging

# Set up basic configuration for logger
logging.basicConfig(
    level=logging.DEBUG,  # This will log all messages DEBUG and above
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# You can also add file handlers or stream handlers if needed
# For example, to log to a file:
# file_handler = logger.FileHandler('logfile.log')
# formatter = logger.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# file_handler.setFormatter(formatter)
# logger.getLogger('').addHandler(file_handler)
