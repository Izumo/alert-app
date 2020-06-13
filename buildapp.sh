oc new-app --name=alert -e MONGODB_SERVICE=mongodb -e MONGODB_USER=mongodb -e MONGODB_PASS=mongodb nodejs~https://github.com/Izumo/alert-app.git
oc expose svc alert
