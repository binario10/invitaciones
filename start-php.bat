@echo off
REM Levanta el servidor PHP local con limite de 256 MB para videos y musica MP3
php -d upload_max_filesize=256M -d post_max_size=260M -d max_execution_time=300 -d max_input_time=300 -S localhost:8000
