# Terraform으로 willog-demo K8s 배포

Deployment, Service, Ingress를 **Terraform HCL로만** 정의하여 적용합니다 (별도 YAML 파일 없음).

## 사전 요건

- Terraform >= 1.0
- `kubectl`이 동작하는 클러스터 (context 설정됨)
- [hashicorp/kubernetes](https://registry.terraform.io/providers/hashicorp/kubernetes) provider ~> 2.23

## 사용법

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

변수로 이미지·네임스페이스·Ingress 호스트를 바꿀 수 있습니다:

```bash
terraform apply \
  -var="namespace=willog-demo" \
  -var="image=ghcr.io/org/willog-demo:v1" \
  -var="ingress_host=app.example.com"
```

또는 `terraform.tfvars.example`을 복사해 `terraform.tfvars`로 저장한 뒤 값을 채우고 `terraform apply`만 실행하면 됩니다.

**namespace 사용 시**: 네임스페이스를 지정한 경우, 첫 적용에서 Deployment가 실패할 수 있습니다. 그럴 때는 `terraform apply`를 한 번 더 실행하거나, 미리 `kubectl create namespace <이름>`으로 네임스페이스를 만들어 두세요.

## AWS EKS에 배포할 때

1. `aws_region`, `eks_cluster_name`을 설정 (terraform.tfvars 또는 -var).
2. kubeconfig에 EKS 클러스터 등록:
   ```bash
   aws eks update-kubeconfig --region <aws_region> --name <eks_cluster_name>
   ```
3. `terraform apply` 실행.

`eks_cluster_name`을 설정하면 출력에 `eks_update_kubeconfig_command`가 나옵니다.

## 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `aws_region` | AWS 리전 (EKS 클러스터 리전) | `ap-northeast-2` |
| `eks_cluster_name` | EKS 클러스터 이름 (지정 시 클러스터 정보 출력) | `""` |
| `kube_config_path` | kubeconfig 경로 | `~/.kube/config` |
| `namespace` | 배포할 네임스페이스 (비우면 default) | `""` |
| `image` | 컨테이너 이미지 (비우면 ECR 기본 이미지) | `""` |
| `ingress_host` | Ingress 호스트명 (비우면 willog-demo.example.com) | `""` |
