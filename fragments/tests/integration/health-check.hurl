# Health Check Test
GET http://localhost:8080

# Expect HTTP 200 OK
HTTP/1.1 200

# Expect no-cache header
Cache-Control: no-cache

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
