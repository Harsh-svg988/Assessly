{{- define "assessly.fullname" -}}
assessly
{{- end -}}

{{- define "assessly.labels" -}}
app.kubernetes.io/name: assessly
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "assessly.selectorLabels" -}}
app.kubernetes.io/name: assessly
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
