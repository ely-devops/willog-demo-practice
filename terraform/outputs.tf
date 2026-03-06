output "namespace" {
  description = "배포된 네임스페이스 (default 또는 지정한 값)"
  value       = var.namespace != "" ? var.namespace : "default"
}

output "deployment_name" {
  description = "Deployment 이름"
  value       = "willog-demo"
}

output "service_name" {
  description = "Service 이름"
  value       = "willog-demo"
}

# EKS 클러스터 이름이 설정된 경우에만 출력
output "eks_cluster_endpoint" {
  description = "EKS 클러스터 API 엔드포인트"
  value       = length(data.aws_eks_cluster.this) > 0 ? data.aws_eks_cluster.this[0].endpoint : null
}

output "eks_update_kubeconfig_command" {
  description = "EKS kubeconfig 설정 명령 (한 번 실행 후 terraform apply)"
  value       = length(data.aws_eks_cluster.this) > 0 ? "aws eks update-kubeconfig --region ${var.aws_region} --name ${var.eks_cluster_name}" : null
}
