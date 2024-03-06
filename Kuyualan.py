import webbrowser
import os
import http.server
import socketserver

# Set the directory containing your HTML and other files
directory = '\\'.join(os.path.abspath(__file__).split('\\')[:-1])

# Set the port you want to use
port = 8000

# Change to the project directory
os.chdir(directory)

# Start a simple HTTP server
handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", port), handler)

print(f"Serving at http://localhost:{port}")

# Open the default web browser
files = os.listdir(directory + "\\records")
jsonFiles = [file for file in files if file.startswith("people")]
jsonFiles.sort()
webbrowser.open_new_tab(f"http://localhost:{port}?js={jsonFiles[-1]}")

# Start serving
httpd.serve_forever()
