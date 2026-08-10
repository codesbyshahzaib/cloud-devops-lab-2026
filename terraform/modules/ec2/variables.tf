variable "public_subnet_id" {
  description = "ID of the public subnet"
  type        = string
}
variable "private_subnet_id" {
  description = "ID of the private subnet"
  type        = string
}
variable "bastion_sg_id" {
  description = "ID of the bastion security group"
  type        = string
}
variable "app_sg_id" {
  description = "ID of the app server security group"
  type        = string
}
variable "key_name" {
  description = "SSH key pair name"
  type        = string
}
variable "iam_instance_profile_name" {
  description = "The name of the IAM instance profile to attach"
  type        = string
}
