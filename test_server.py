#!/usr/bin/env python3
"""
Serveur HTTP simple pour tester le Real-Time de SeaFarm Monitor
"""
import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = "/home/user/webapp"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        print(f"[HTTP] {self.address_string()} - {format % args}")

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
        print(f"✅ Serveur HTTP démarré sur http://0.0.0.0:{PORT}")
        print(f"📁 Répertoire: {DIRECTORY}")
        print(f"🌐 Accès local: http://localhost:{PORT}/test_realtime_browser.html")
        print(f"🚀 Test Real-Time: http://localhost:{PORT}/test_realtime_browser.html")
        print("\nAppuyez sur Ctrl+C pour arrêter...")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Serveur arrêté")
