module "vpc" {
  source = "./modules/vpc"
}

module "security_groups" {
  source = "./modules/security-groups"
  vpc_id = module.vpc.vpc_id
}

module "ec2" {
  source                    = "./modules/ec2"
  public_subnet_id          = module.vpc.public_subnet_id
  private_subnet_id         = module.vpc.private_subnet_id
  bastion_sg_id             = module.security_groups.bastion_sg_id
  app_sg_id                 = module.security_groups.app_sg_id
  key_name                  = var.key_name
  iam_instance_profile_name = module.iam.instance_profile_name
}
module "iam" {
  source = "./modules/iam"
}