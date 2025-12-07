# PUT updates fragment data

# Create initial fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`original text`

HTTP/1.1 201

[Captures]
url: header "Location"

# Update fragment via PUT
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`updated text`

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"

# Verify updated content
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
body == "updated text"
