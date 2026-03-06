# 네임스페이스 사용 시 생성
resource "kubernetes_namespace" "app" {
  count = var.namespace != "" ? 1 : 0

  metadata {
    name = var.namespace
  }
}

# HCL로 정의 (YAML 파일 없음)
locals {
  app_name = "willog-demo"
  image    = var.image != "" ? var.image : "416849462746.dkr.ecr.ap-northeast-2.amazonaws.com/prod-willog-demo-ecr:latest"
  ingress_host = var.ingress_host != "" ? var.ingress_host : "willog-demo.example.com"

  deployment_manifest = {
    apiVersion = "apps/v1"
    kind       = "Deployment"
    metadata = {
      name   = local.app_name
      labels = { app = local.app_name }
    }
    spec = {
      replicas = 2
      selector = { matchLabels = { app = local.app_name } }
      template = {
        metadata = { labels = { app = local.app_name } }
        spec = {
          nodeSelector = { "kubernetes.io/arch" = "arm64" }
          containers = [
            {
              name  = "app"
              image = local.image
              ports = [{ containerPort = 8080, name = "http" }]
              livenessProbe = {
                httpGet             = { path = "/health", port = 8080 }
                initialDelaySeconds = 10
                periodSeconds       = 10
              }
              readinessProbe = {
                httpGet             = { path = "/health", port = 8080 }
                initialDelaySeconds = 5
                periodSeconds       = 5
              }
            }
          ]
        }
      }
    }
  }

  service_manifest = {
    apiVersion = "v1"
    kind       = "Service"
    metadata = {
      name   = local.app_name
      labels = { app = local.app_name }
    }
    spec = {
      type     = "ClusterIP"
      selector = { app = local.app_name }
      ports = [{
        port       = 8080
        targetPort = 8080
        protocol   = "TCP"
        name       = "http"
      }]
    }
  }

  ingress_manifest = {
    apiVersion = "networking.k8s.io/v1"
    kind       = "Ingress"
    metadata = {
      name   = local.app_name
      labels = { app = local.app_name }
    }
    spec = {
      ingressClassName = "nginx"
      rules = [{
        host = local.ingress_host
        http = {
          paths = [{
            path     = "/"
            pathType = "Prefix"
            backend = {
              service = {
                name = local.app_name
                port = { number = 8080 }
              }
            }
          }]
        }
      }]
    }
  }
}

# merge가 metadata 전체를 덮어쓰므로, namespace만 metadata에 넣는 방식으로 수정
locals {
  deployment_manifest_final = var.namespace != "" ? merge(local.deployment_manifest, {
    metadata = merge(local.deployment_manifest.metadata, { namespace = var.namespace })
  }) : local.deployment_manifest

  service_manifest_final = var.namespace != "" ? merge(local.service_manifest, {
    metadata = merge(local.service_manifest.metadata, { namespace = var.namespace })
  }) : local.service_manifest

  ingress_manifest_final = var.namespace != "" ? merge(local.ingress_manifest, {
    metadata = merge(local.ingress_manifest.metadata, { namespace = var.namespace })
  }) : local.ingress_manifest
}

resource "kubernetes_manifest" "deployment" {
  manifest = local.deployment_manifest_final
}

resource "kubernetes_manifest" "service" {
  manifest   = local.service_manifest_final
  depends_on = [kubernetes_manifest.deployment]
}

resource "kubernetes_manifest" "ingress" {
  manifest   = local.ingress_manifest_final
  depends_on = [kubernetes_manifest.service]
}
