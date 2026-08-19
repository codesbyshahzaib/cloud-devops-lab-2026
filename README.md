# Cloud DevOps Lab 2026

This repository contains a complete, automated DevOps infrastructure setup using Terraform, Ansible, Docker, and Jenkins. It provisions AWS infrastructure, configures servers, and deploys a fully monitored CI/CD pipeline alongside a sample Node.js application.

## 🏗 Architecture Overview

1.  **Infrastructure as Code (Terraform):**
    *   **VPC & Networking:** Custom VPC with public and private subnets, Internet Gateway, and NAT Gateway.
    *   **Compute:** 
        *   **Bastion Host:** Located in the public subnet, used for secure SSH access and acts as a public Nginx reverse proxy to expose services.
        *   **App Server:** Located in the private subnet (highly secure). Runs all application and tool containers.
    *   **Security:** Configured Security Groups and IAM Roles for CloudWatch and SSM access.
2.  **Configuration Management (Ansible):**
    *   Automates the setup of both servers (`site.yml`).
    *   Installs Docker, Docker Compose, UFW (Firewall), Fail2ban, and CloudWatch Agents.
    *   Deploys an Nginx reverse proxy on the Bastion Host.
3.  **Services (Docker Compose):**
    *   **Node.js App:** A sample application running on port 3000.
    *   **Jenkins:** For CI/CD automation (`/jenkins/`).
    *   **SonarQube:** For static code analysis and quality gates (`/sonar/`).
    *   **Prometheus & Grafana:** For metrics collection and visualization (`/grafana/`).
4.  **CI/CD Pipeline (Jenkinsfile):**
    *   Builds the Node app, runs unit tests, executes SonarQube analysis, and uses Ansible to deploy the updated app to the server.

## 🚀 Complete Setup Guide

Follow these steps to deploy the entire infrastructure from scratch.

### Prerequisites

*   **AWS CLI** installed and configured with appropriate credentials (`aws configure`).
*   **Terraform** installed.
*   **Ansible** installed.
*   An AWS SSH Key Pair named `webkeys` (or update the `key_name` variable in Terraform and `ansible_ssh_private_key_file` in Ansible). Make sure you have `~/.ssh/webkeys.pem` locally.

### Step 1: Provision Infrastructure (Terraform)

1.  Navigate to the `terraform` directory:
    ```bash
    cd terraform
    ```
2.  Initialize Terraform:
    ```bash
    terraform init
    ```
3.  Plan and Apply the configuration:
    ```bash
    terraform apply -auto-approve
    ```
4.  Note the outputs at the end of the run. You will need the `bastion_ip` and `app_ip`.

### Step 2: Update Ansible Inventory

1.  Navigate to the `ansible` directory:
    ```bash
    cd ../ansible
    ```
2.  Open `inventory.ini` and update the IP addresses with the Terraform outputs:
    ```ini
    [bastion]
    bastion_host ansible_host=<YOUR_BASTION_IP>

    [app_server]
    app_server_host ansible_host=<YOUR_APP_IP>
    ```

### Step 3: Configure Servers & Deploy Services (Ansible)

Run the main Ansible playbook to configure both the Bastion and App Server. This will also pull and start all Docker containers (Jenkins, SonarQube, Grafana, App).

```bash
ansible-playbook -i inventory.ini site.yml
```

*Note: This process may take a few minutes as it installs Docker, pulls images, and configures the reverse proxies.*

### Step 4: Access Your Services

Because the App Server is securely locked in a private subnet, the **Bastion Host** acts as a reverse proxy. Use the **Bastion's Public IP** in your browser to access the deployed services:

*   **Node App:** `http://<BASTION_IP>/`
*   **Jenkins:** `http://<BASTION_IP>/jenkins/`
*   **SonarQube:** `http://<BASTION_IP>/sonar/`
*   **Grafana:** `http://<BASTION_IP>/grafana/`

> **Security Warning:** These endpoints are exposed on port 80 (HTTP). Ensure you configure strong administrative passwords for Jenkins, SonarQube, and Grafana immediately upon first login.

## 🛠 CI/CD Pipeline Usage

The repository includes a `Jenkinsfile` for continuous integration and deployment.

1.  Log in to **Jenkins**.
2.  Create a new **Pipeline** job.
3.  Configure the job to pull from your Git repository.
4.  Ensure Jenkins has the necessary credentials configured (e.g., SonarQube token, AWS credentials if required by Ansible).
5.  Run the pipeline. The pipeline will automatically lint, test, analyze, build, and deploy your Node.js application to the App Server.

## 🧹 Teardown

To destroy the infrastructure and stop incurring AWS charges, run:

```bash
cd terraform
terraform destroy -auto-approve
```
