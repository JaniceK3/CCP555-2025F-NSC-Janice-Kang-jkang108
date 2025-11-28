# Posting a fragment with charset in Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Hello This is a charset test`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
# Your implementation normalizes the type to "text/plain"
jsonpath "$.fragment.type" == "text/plain"

[Captures]
url: header "Location"

# GET the fragment back
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
# Some implementations might add charset here, some might not,
# so just assert it starts with text/plain
[Asserts]
header "Content-Type" matches "^text/plain"
body == "Hello This is a charset test"
