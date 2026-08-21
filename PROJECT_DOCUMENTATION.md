# Cloud DevOps Lab 2026 - Comprehensive Project Documentation

This document provides an in-depth, component-by-component explanation of the `cloud-devops-lab-2026` project. This project is a complete, automated DevOps infrastructure setup using **Terraform**, **Ansible**, **Docker**, and **Jenkins**. It provisions AWS infrastructure, configures servers, and deploys a fully monitored CI/CD pipeline alongside a sample Node.js application.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Infrastructure as Code (Terraform)](#infrastructure-as-code-terraform)
3. [Configuration Management (Ansible)](#configuration-management-ansible)
4. [Continuous Integration & Deployment (Jenkinsfile)](#continuous-integration--deployment-jenkinsfile)
5. [Application (Node.js)](#application-nodejs)
6. [Monitoring & Quality Analysis](#monitoring--quality-analysis)
7. [Getting Started (Deployment Flow)](#getting-started-deployment-flow)

---

## 1. Architecture Overview

The infrastructure is hosted on AWS. It uses a **Two-Tier Architecture**:
- **Public Tier (Bastion Host):** Located in a public subnet with an Internet Gateway. It acts as an SSH gateway (Bastion) and a reverse proxy (using Nginx) to securely expose internal services to the internet.
- **Private Tier (App Server):** Located in a private subnet, with outbound internet access via a NAT Gateway. This server is highly secure and runs all backend services as Docker containers: the Node.js App, Jenkins, SonarQube, Prometheus, and Grafana.

---

## 2. Infrastructure as Code (Terraform)

Terraform is used to provision the foundational AWS resources. The configuration is modularized for reusability and maintainability.

### Directories & Modules:
- **`terraform/`**: The primary infrastructure code.
  - **`main.tf`**: The entry point that calls various modules (`vpc`, `security-groups`, `ec2`, `iam`).
  - **`modules/vpc/`**: Provisions the Virtual Private Cloud (VPC), Public and Private Subnets, Route Tables, Internet Gateway (IGW), and NAT Gateway.
  - **`modules/security-groups/`**: Defines strictly scoped Security Groups for the Bastion Host (allowing SSH, HTTP/HTTPS) and the App Server (allowing internal traffic from the Bastion).
  - **`modules/ec2/`**: Provisions the actual EC2 instances (Bastion and App Server) and attaches the security groups and IAM profiles.
  - **`modules/iam/`**: Creates IAM roles and instance profiles necessary for the EC2 instances to interact with AWS services like Systems Manager (SSM) and CloudWatch.
- **`terraform-state-bootstrap/`**: Contains Terraform code used to bootstrap the remote state backend (e.g., an S3 bucket for state storage and a DynamoDB table for state locking) to enable team collaboration.

---

## 3. Configuration Management (Ansible)

Once Terraform provisions the bare EC2 instances, Ansible is used to provision software, apply configurations, and orchestrate Docker containers.

### Key Components:
- **`ansible/site.yml`**: The master playbook that dictates which roles are applied to which hosts (`bastion` vs `app_server`).
- **`ansible/inventory.ini`**: The inventory file containing the IP addresses of the provisioned servers.
- **`ansible/ansible.cfg`**: Configures Ansible defaults.
- **`ansible/deploy_app.yml`**: A specific playbook invoked by Jenkins during the CI/CD pipeline to deploy new versions of the Node.js application.

### Ansible Roles (located in `ansible/roles/`):
- **`common` / `users`**: Base server setup, user creation, and essential packages.
- **`ufw` / `fail2ban`**: Security hardening. UFW configures the local firewall, while Fail2ban prevents brute-force SSH attacks.
- **`docker` / `docker_compose`**: Installs the Docker engine and Docker Compose on the App Server.
- **`ssm_secrets`**: Retrieves sensitive variables (like database passwords or API keys) securely from AWS Systems Manager Parameter Store.
- **`bastion_proxy` / `nginx_proxy`**: Configures Nginx to route external traffic from the Bastion public IP to the specific Docker containers running in the private subnet.
- **`jenkins`, `prometheus`, `grafana`, `sonar_exporter`**: Deployment roles for the respective CI/CD and monitoring tools.
- **`cloudwatch_agent`**: Installs and configures the AWS CloudWatch agent for centralized log and metric collection.

---

## 4. Continuous Integration & Deployment (Jenkinsfile)

The `Jenkinsfile` in the root directory defines a declarative Jenkins Pipeline that automates the software delivery lifecycle. 

### Pipeline Stages:
1. **Checkout**: Pulls the latest source code from the repository.
2. **Lint**: Runs ESLint inside an ephemeral Node.js Docker container to enforce code style.
3. **Test**: Executes Jest unit tests inside an ephemeral Node.js container to ensure code correctness.
4. **SonarQube Analysis**: Performs static code analysis using the SonarScanner tool and sends the report to the local SonarQube server to check against Quality Gates.
5. **Build Image**: Builds a Docker image for the Node.js application.
6. **Push Image**: Authenticates with DockerHub and pushes the newly built image (tagged with the build number and `latest`).
7. **Deploy**: Invokes the local `ansible/deploy_app.yml` playbook, instructing the App Server to pull the new Docker image and restart the application container.

---

## 5. Application (Node.js)

The `app/` directory contains a sample modern web application used to demonstrate the CI/CD pipeline.
- **Framework**: Node.js with Express (assumed based on `index.js` and `routes/`).
- **Testing**: Jest (`index.test.js` and `tests/`).
- **Code Quality**: ESLint (`.eslintrc.json`).
- **Containerization**: `Dockerfile` is present to package the application into a lightweight, portable image.

---

## 6. Monitoring & Quality Analysis

The infrastructure enforces high visibility and strict code quality:
- **Prometheus & Grafana**: Prometheus scrapes metrics from the servers and application, while Grafana provides visual dashboards. The `ansible/roles/grafana/templates/provisioning/dashboards/` directory defines custom dashboards as code.
- **SonarQube**: Integrated directly into the Jenkins pipeline to analyze code smells, bugs, and test coverage before a build is allowed to deploy.
- **CloudWatch**: Server logs (like Nginx access logs or syslog) are pushed to AWS CloudWatch for centralized viewing and alerting.

---

## 7. Getting Started (Deployment Flow)

To launch this environment from scratch:
1. **Bootstrap State:** (Optional) Run `terraform apply` in `terraform-state-bootstrap` to setup remote state.
2. **Provision Infrastructure:** Navigate to `terraform/`, run `terraform init` and `terraform apply`. Note the output IPs.
3. **Configure Servers:** Update `ansible/inventory.ini` with the IPs from Terraform. Run `ansible-playbook -i inventory.ini site.yml` to install all software and start the services.
4. **Access Services:** Open the Bastion's Public IP in a browser to access the Node App (`/`), Jenkins (`/jenkins`), SonarQube (`/sonar`), and Grafana (`/grafana`).
5. **Setup CI/CD:** Login to Jenkins, create a new pipeline pointing to this repository, and trigger a build to see the automated deployment in action!
