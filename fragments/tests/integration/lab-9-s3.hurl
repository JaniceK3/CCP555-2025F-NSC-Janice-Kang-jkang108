# Lab 9 – S3 integration test

# 1. Create a new text fragment stored in S3
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"

[Captures]
url: header "Location"


# 2. Retrieve the fragment we just created
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" matches "^text/plain"
body == "Hello S3!"


# 3. Delete the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"


# 4. Try to GET again -> should be 404
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404