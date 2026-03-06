variable "aws_region" {
  description = "AWS 리전 (EKS 클러스터가 있는 리전)"
  type        = string
  default     = "ap-northeast-2"
}

variable "eks_cluster_name" {
  description = "EKS 클러스터 이름 (지정 시 클러스터 정보 조회·출력, 인증은 aws eks update-kubeconfig 선행 필요)"
  type        = string
  default     = ""
}

variable "kube_config_path" {
  description = "kubeconfig 파일 경로 (비우면 KUBECONFIG 환경변수 또는 기본 경로 사용)"
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  description = "리소스를 배포할 네임스페이스 (비우면 default)"
  type        = string
  default     = ""
}

variable "image" {
  description = "Deployment에 사용할 컨테이너 이미지 (비우면 ECR 기본 이미지 사용)"
  type        = string
  default     = ""
}

variable "ingress_host" {
  description = "Ingress에 사용할 호스트명 (비우면 willog-demo.example.com)"
  type        = string
  default     = ""
}
