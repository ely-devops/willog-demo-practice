# EKS 클러스터 이름이 지정된 경우에만 조회 (output용)
data "aws_eks_cluster" "this" {
  count = var.eks_cluster_name != "" ? 1 : 0

  name = var.eks_cluster_name
}
