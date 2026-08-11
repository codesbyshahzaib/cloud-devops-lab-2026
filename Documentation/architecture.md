# Infrastructure Architecture

This diagram illustrates the exact infrastructure provisioned by Terraform, including the VPC, subnets, instances, and the Docker containers orchestrated by Ansible.

```mermaid
graph TB
    subgraph AWS ["AWS Cloud (us-east-1)"]
        direction TB
        
        IGW[Internet Gateway]
        
        subgraph VPC ["VPC (10.0.0.0/16)"]
            direction TB
            
            subgraph Public_Subnet ["Public Subnet (10.0.1.0/24 - us-east-1a)"]
                direction TB
                NAT["NAT Gateway (with EIP)"]
                
                subgraph Bastion_Host ["Bastion Host (t3.micro)"]
                    Bastion_Nginx["Nginx Reverse Proxy"]
                end
            end
            
            subgraph Private_Subnet ["Private Subnet (10.0.2.0/24 - us-east-1a)"]
                direction TB
                
                subgraph App_Server ["App Server (m7i-flex.large)"]
                    direction TB
                    CW_Agent["CloudWatch Agent"]
                    
                    subgraph Docker_Compose ["Docker Compose Services"]
                        Internal_Nginx["Internal Nginx Proxy"]
                        NodeApp["Node.js Application"]
                        Jenkins["Jenkins CI/CD"]
                        SonarQube["SonarQube"]
                        Prometheus["Prometheus"]
                        Grafana["Grafana"]
                    end
                end
            end
        end
        
        CloudWatch["AWS CloudWatch\n(Logs & Metrics)"]
        SSM["AWS Systems Manager\n(Parameter Store)"]
    end
    
    %% External Traffic
    Internet((Internet / User)) -->|HTTP (80)| IGW
    Internet -->|SSH (22)| IGW
    
    %% Routing in VPC
    IGW --> Bastion_Host
    IGW --> NAT
    
    %% Proxy and SSH paths
    Bastion_Nginx ==>|Proxy Pass HTTP (80)| Internal_Nginx
    Bastion_Host -.->|SSH (22)| App_Server
    
    %% Internal Docker Routing
    Internal_Nginx --> NodeApp
    Internal_Nginx --> Jenkins
    Internal_Nginx --> SonarQube
    Internal_Nginx --> Grafana
    
    %% Monitoring connections
    Prometheus -.-> NodeApp
    Prometheus -.-> Jenkins
    Grafana -.-> Prometheus
    
    %% Outbound connections & AWS Services
    App_Server -.->|Outbound Traffic| NAT
    CW_Agent -.->|Send Metrics| CloudWatch
    App_Server -.->|Read Secrets| SSM

    %% Styling
    classDef vpc fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    classDef public fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef private fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef instance fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef container fill:#ede7f6,stroke:#5e35b1,stroke-width:1px;
    classDef aws_service fill:#fff,stroke:#ff9900,stroke-width:2px;
    
    class VPC vpc;
    class Public_Subnet public;
    class Private_Subnet private;
    class Bastion_Host,App_Server instance;
    class Internal_Nginx,NodeApp,Jenkins,SonarQube,Prometheus,Grafana container;
    class CloudWatch,SSM aws_service;
```

## Flow Overview

1. **Inbound Web Traffic:** A user connects via the Internet to the Bastion host's public IP on port 80.
2. **First Reverse Proxy:** Nginx on the Bastion Host (`bastion_proxy` role) receives the traffic and proxies it directly to the App Server's private IP (`10.0.2.211`) on port 80.
3. **Second Reverse Proxy:** Nginx inside the Docker network on the App Server (`infra_services` role) looks at the path (e.g., `/jenkins`, `/sonar`) and proxies the traffic to the corresponding Docker container.
4. **Outbound Traffic:** When the App Server or its containers need to reach the internet (to download packages, run `apt-get`, or pull git repos), traffic routes through the **NAT Gateway** in the public subnet.
5. **Monitoring:** CloudWatch Agent runs on both servers pushing metrics/logs to AWS CloudWatch. Prometheus internally scrapes container metrics and Grafana visualizes them.
