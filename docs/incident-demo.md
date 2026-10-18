# Demonstrated fault + recovery: bad readiness probe on rollout

This is a real sequence run against the local `kind` cluster (not a hypothetical),
showing a bad release being caught before it affects users, and the rollback path.

## Symptom
A release changed the readiness probe path to a route that doesn't exist
(`/api/does-not-exist`), simulating a config mistake during a rollout
(e.g. a renamed health route not matched in the Helm values).

```
helm upgrade assessly ./helm/assessly -n assessly \
  --set probes.readiness.path=/api/does-not-exist ...
```

## Hypothesis
The new pod will fail its readiness probe and never enter `Ready`. Because the
Deployment uses `RollingUpdate` with `maxUnavailable: 0`, Kubernetes should
refuse to remove the last healthy old pod until a new one passes readiness —
so the bad rollout should stall without taking the service down.

## Evidence
```
$ kubectl -n assessly get pods
NAME                        READY   STATUS    RESTARTS   AGE
assessly-599f559466-8bsfc   0/1     Running   0          22s   <- new, bad
assessly-cdcc75d8-5f9tp     1/1     Running   0          4m27s <- old, still serving
assessly-cdcc75d8-ltvfq     1/1     Running   0          4m38s <- old, still serving

$ kubectl -n assessly describe pod assessly-599f559466-8bsfc
Warning  Unhealthy  6s (x2 over 16s)  kubelet  Readiness probe failed: HTTP probe failed with statuscode: 404

$ curl -s -o /dev/null -w "%{http_code}\n" http://assessly.local/
200   <- service unaffected throughout
```

## Change (recovery)
```
$ helm rollback assessly 2 -n assessly
Rollback was a success! Happy Helming!
```

## Verification
```
$ kubectl -n assessly rollout status deployment/assessly
deployment "assessly" successfully rolled out

$ kubectl -n assessly get pods
assessly-cdcc75d8-5f9tp   1/1   Running   0   ...
assessly-cdcc75d8-ltvfq   1/1   Running   0   ...

$ kubectl -n assessly get deployment assessly -o jsonpath='{.spec.template.spec.containers[0].readinessProbe.httpGet.path}'
/api/ready   <- correct path restored, no bad pod left behind
```

## Takeaway
`maxUnavailable: 0` + a readiness probe tied to real dependency config
(`/api/ready` checks that Clerk/Convex/Stream env vars are present) is what
made this a non-event for users instead of an outage. The same mechanism
would also catch a genuinely broken image (crashing on boot, missing env var)
before it reached 100% of traffic. `helm rollback <release> <revision>` is the
documented recovery path; `helm history assessly -n assessly` lists revisions.
