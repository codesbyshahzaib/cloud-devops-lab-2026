output "bastion_ip" {
  value = aws_instance.bastion_host.public_ip
}
output "app_ip" {
  value = aws_instance.app_server.private_ip
}
