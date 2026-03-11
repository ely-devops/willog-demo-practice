{{/*
Expand the name of the chart.
*/}}
{{- define "willog-demo.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "willog-demo.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s" $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "willog-demo.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app: {{ include "willog-demo.fullname" . }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "willog-demo.selectorLabels" -}}
app: {{ include "willog-demo.fullname" . }}
{{- end }}
