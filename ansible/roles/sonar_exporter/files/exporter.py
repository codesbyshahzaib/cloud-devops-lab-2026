"""
SonarQube Code Quality → Prometheus Exporter
Queries SonarQube Web API for project-level metrics and exposes them
in Prometheus format at /metrics on port 9101.
"""
import http.server
import urllib.request
import json
import os
import time

SONAR_URL = os.environ.get("SONAR_URL", "http://sonarqube:9000/sonar")
SONAR_TOKEN = os.environ.get("SONAR_TOKEN", "")
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "60"))
PORT = 9101

METRICS_TO_FETCH = [
    "bugs", "vulnerabilities", "code_smells",
    "coverage", "duplicated_lines_density",
    "ncloc", "sqale_index", "reliability_rating",
    "security_rating", "sqale_rating"
]

cached_metrics = ""
last_poll = 0


def fetch_sonar_metrics():
    """Query SonarQube Web API and build Prometheus-format output."""
    global cached_metrics, last_poll

    now = time.time()
    if now - last_poll < POLL_INTERVAL and cached_metrics:
        return cached_metrics

    lines = []
    lines.append("# SonarQube Code Quality Exporter")

    try:
        # Get all projects
        url = f"{SONAR_URL}/api/projects/search?ps=100"
        req = urllib.request.Request(url)
        if SONAR_TOKEN:
            import base64
            auth = base64.b64encode(f"{SONAR_TOKEN}:".encode()).decode()
            req.add_header("Authorization", f"Basic {auth}")

        with urllib.request.urlopen(req, timeout=10) as resp:
            projects = json.loads(resp.read())

        for project in projects.get("components", []):
            pkey = project["key"]
            pname = project.get("name", pkey)

            # Get measures for this project
            metric_keys = ",".join(METRICS_TO_FETCH)
            murl = f"{SONAR_URL}/api/measures/component?component={pkey}&metricKeys={metric_keys}"
            mreq = urllib.request.Request(murl)
            if SONAR_TOKEN:
                mreq.add_header("Authorization", f"Basic {auth}")

            with urllib.request.urlopen(mreq, timeout=10) as mresp:
                measures = json.loads(mresp.read())

            for m in measures.get("component", {}).get("measures", []):
                metric = m["metric"]
                value = m.get("value", "0")
                try:
                    val = float(value)
                except ValueError:
                    continue
                lines.append(
                    f'sonarqube_{metric}{{project="{pkey}",name="{pname}"}} {val}'
                )

        lines.append(f"sonarqube_exporter_up 1")
        lines.append(f"sonarqube_exporter_last_scrape {int(now)}")

    except Exception as e:
        lines.append(f"sonarqube_exporter_up 0")
        lines.append(f"# Error: {e}")

    cached_metrics = "\n".join(lines) + "\n"
    last_poll = now
    return cached_metrics


class MetricsHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/metrics":
            output = fetch_sonar_metrics()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(output.encode())
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<a href='/metrics'>Metrics</a>")

    def log_message(self, format, *args):
        pass  # Suppress request logs


if __name__ == "__main__":
    print(f"SonarQube exporter starting on port {PORT}")
    print(f"Polling SonarQube at: {SONAR_URL}")
    server = http.server.HTTPServer(("0.0.0.0", PORT), MetricsHandler)
    server.serve_forever()
