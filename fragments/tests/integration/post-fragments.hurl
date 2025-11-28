# tests/integration/post-fragments.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`This is a fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
# Location header should contain a valid fragment URL
header "Location" matches "^http://localhost:8080/v1/fragments/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# UUID-like id
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# ownerId is hex
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# created/updated are strings
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
# type and size
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. GET the fragment we just posted
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 19

[Asserts]
body == "This is a fragment!"
